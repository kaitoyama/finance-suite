'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { useUpdateExpenseRequestMutation } from '@/hooks/useUpdateExpenseRequestMutation';
import { useResubmitExpenseRequestMutation } from '@/hooks/useResubmitExpenseRequestMutation';
import { useExpenseRequestForEdit } from '@/hooks/useExpenseRequestForEdit';
import { useGetCategories } from '@/hooks/useCategory';
import { useGetAccounts } from '@/hooks/useAccount';
import { useCreateAttachment, useCreatePresignedPost } from '@/hooks/useAttachment';
import { UpdateExpenseRequestInput, CreateAttachmentInput } from '@/gql/graphql';

const expenseEditFormSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  accountId: z.string().min(1, 'Account is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  attachment: z.instanceof(File).optional(),
});

type ExpenseEditFormValues = z.infer<typeof expenseEditFormSchema>;

export default function EditExpenseRequestPage() {
  const router = useRouter();
  const params = useParams();
  const idParam = params.id as string;
  const id = idParam ? parseInt(idParam, 10) : 0;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Use hooks before any early returns - only call when we have a valid ID
  // Pass undefined to skip query if id is invalid, ensuring hook is always called
  const { data: expenseData, fetching: expenseLoading, error: expenseError, refetch: refetchExpense } = useExpenseRequestForEdit(id);
  const { updateExpenseRequest } = useUpdateExpenseRequestMutation();
  const { resubmitExpenseRequest } = useResubmitExpenseRequestMutation();
  const { categories, loading: categoriesLoading, error: categoriesError } = useGetCategories();
  const { accounts, loading: accountsLoading, error: accountsError } = useGetAccounts();
  const { createAttachment } = useCreateAttachment();
  const { presignedPost, error: presignedPostError } = useCreatePresignedPost();

  const form = useForm<ExpenseEditFormValues>({
    resolver: zodResolver(expenseEditFormSchema),
    defaultValues: {
      amount: 0,
      accountId: '',
      categoryId: '',
      description: '',
    },
  });

  // Initialize form with existing data
  useEffect(() => {
    if (expenseData) {
      form.reset({
        amount: expenseData.amount,
        description: expenseData.description || '',
        accountId: '',
        categoryId: '',
      });
    }
  }, [expenseData, form]);

  useEffect(() => {
    if (expenseData?.account && accounts?.length) {
      form.setValue('accountId', expenseData.account.id.toString(), { shouldValidate: true });
    }
  }, [expenseData?.account, accounts, form]);

  useEffect(() => {
    if (expenseData?.category && categories?.length) {
      form.setValue('categoryId', expenseData.category.id.toString(), { shouldValidate: true });
    }
  }, [expenseData?.category, categories, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      form.setValue('attachment', event.target.files[0]);
    }
  };

  const onSubmit = async (values: ExpenseEditFormValues) => {
    setIsSubmitting(true);
    let finalAttachmentId: number | undefined = undefined;

    try {
      // Handle file upload if a new file was selected
      if (selectedFile) {
        const s3Key = `${self.crypto.randomUUID()}-${selectedFile.name}`;

        // 1. Get presigned URL for S3 upload
        const presignedPostResult = await presignedPost(s3Key);

        if (presignedPostError || !presignedPostResult) {
          throw new Error(presignedPostError?.message || 'Failed to get upload URL.');
        }

        const { url } = presignedPostResult;

        // 2. Upload file directly to R2 using presigned PUT
        const s3UploadPromise = fetch(url, {
          method: 'PUT',
          body: selectedFile,
          headers: {
            'Content-Type': selectedFile.type || 'application/octet-stream'
          }
        });

        await toast.promise(
          s3UploadPromise.then(async (s3Response) => {
            if (!s3Response.ok) {
              throw new Error(`S3 upload failed: ${s3Response.status} ${s3Response.statusText}`);
            }

            // 3. Create attachment record in DB
            const attachmentInput: CreateAttachmentInput = {
              title: selectedFile.name,
              s3Key: s3Key,
              amount: values.amount,
            };

            const dbRes = await createAttachment(attachmentInput);
            if (!dbRes || !dbRes.id) {
              throw new Error('Attachment ID not found after DB save.');
            }
            finalAttachmentId = dbRes.id;
            return "Attachment uploaded and saved!";
          }),
          {
            loading: 'Uploading attachment...',
            success: (message) => message,
            error: (err) => `Attachment upload failed: ${err.message}`,
          }
        );
      }

      // 4. Update expense request
      const updateInput: UpdateExpenseRequestInput = {
        id: id,
        amount: values.amount,
        accountId: values.accountId ? parseInt(values.accountId, 10) : undefined,
        categoryId: values.categoryId ? parseInt(values.categoryId, 10) : undefined,
        description: values.description || undefined,
      };

      // Add attachmentId only if finalAttachmentId is defined
      if (finalAttachmentId) {
        updateInput.attachmentId = finalAttachmentId;
      }

      await toast.promise(
        updateExpenseRequest({ input: updateInput }).then(res => {
          if (res.error) throw new Error(res.error.message);
          if (!res.data?.updateExpenseRequest?.id) throw new Error('Failed to update expense request.');
          return 'Expense request updated successfully!';
        }),
        {
          loading: 'Updating expense request...',
          success: (message) => message,
          error: (err) => `Update failed: ${err.message}`,
        }
      );

      // Refetch data to get updated values
      refetchExpense({ requestPolicy: 'network-only' });
      toast.success('経費申請が正常に更新されました。');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during update.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubmit = async () => {
    setIsSubmitting(true);
    try {
      await toast.promise(
        resubmitExpenseRequest({ id }).then(res => {
          if (res.error) throw new Error(res.error.message);
          if (!res.data?.resubmitExpenseRequest?.id) throw new Error('Failed to resubmit expense request.');
          router.push(`/expenses/${id}`);
          return 'Expense request resubmitted successfully!';
        }),
        {
          loading: 'Resubmitting expense request...',
          success: (message) => message,
          error: (err) => `Resubmit failed: ${err.message}`,
        }
      );
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during resubmit.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Only show errors if we have a valid ID and are actually trying to load data
    if (!idParam || !id || isNaN(id) || id <= 0) return;

    if (categoriesError) {
      toast.error(`Categories loading error: ${categoriesError.message}`);
    }
    if (accountsError) {
      toast.error(`Accounts loading error: ${accountsError.message}`);
    }
  }, [categoriesError, accountsError, idParam, id]);

  // Condition flags
  const invalidId = !idParam || !id || isNaN(id) || id <= 0;
  const loading = expenseLoading;
  const loadError = expenseError;
  // Ensure notFound is true only if id is valid and no data/error/loading
  const notFound = !invalidId && !expenseLoading && !expenseError && !expenseData;
  const notRejected = !invalidId && expenseData && expenseData.state !== 'REJECTED';

  let content: React.ReactNode;

  if (invalidId) {
    content = (
      <>
        <Alert variant="destructive">
          <AlertTitle>Invalid ID</AlertTitle>
          <AlertDescription>Invalid expense request ID.</AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">戻る</Button>
      </>
    );
  } else if (loading) {
    content = (
      <>
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </>
    );
  } else if (loadError) {
    content = (
      <Alert variant="destructive">
        <AlertTitle>経費情報の読み込みエラー</AlertTitle>
        <AlertDescription>{loadError.message}</AlertDescription>
      </Alert>
    );
  } else if (notFound) {
    content = (
      <Alert>
        <AlertTitle>見つかりません</AlertTitle>
        <AlertDescription>経費申請が見つかりません。</AlertDescription>
      </Alert>
    );
  } else if (notRejected) {
    content = (
      <>
        <Alert>
          <AlertTitle>編集できません</AlertTitle>
          <AlertDescription>
            差戻し状態の経費申請のみ編集可能です。現在のステータス: {expenseData!.state}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">戻る</Button>
      </>
    );
  } else {
    // expenseData is guaranteed to be valid here
    const expense = expenseData!;
    content = (
      <>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>経費申請の編集</CardTitle>
            <CardDescription>差し戻しされた経費申請を編集して再提出できます</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">申請ID:</span> {expense.id}</p>
              <p><span className="font-medium">現在のステータス:</span> <span className="text-red-600">差し戻し</span></p>
              <p><span className="font-medium">申請日:</span> {new Date(expense.createdAt).toLocaleDateString()}</p>
              {expense.attachment && (
                <p><span className="font-medium">現在の添付ファイル:</span> {expense.attachment.title}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>金額 *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="金額を入力"
                      min="1"
                      step="1"
                      {...field}
                      onChange={event => field.onChange(parseInt(event.target.value, 10) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="accountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>勘定科目 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={accountsLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="勘定科目を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accountsLoading ? (
                        <Skeleton className="h-8 w-full" />
                      ) : (
                        accounts?.map((account) => (
                          <SelectItem key={account.id} value={account.id.toString()}>
                            {account.code} - {account.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>カテゴリ *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={categoriesLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="カテゴリを選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoriesLoading ? (
                        <Skeleton className="h-8 w-full" />
                      ) : (
                        categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                            {category.description && ` - ${category.description}`}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>摘要</FormLabel>
                  <FormControl>
                    <Textarea placeholder="摘要を入力..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>新しい証憑ファイル（任意）</FormLabel>
              <FormControl>
                <Input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
              </FormControl>
              {selectedFile && <FormDescription>選択されたファイル: {selectedFile.name}</FormDescription>}
              <FormDescription>
                新しいファイルを選択しない場合は、現在の証憑ファイルが維持されます。
              </FormDescription>
              <FormMessage />
            </FormItem>

            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={isSubmitting || accountsLoading || categoriesLoading}
                className="flex-1"
              >
                {isSubmitting ? '更新中...' : '変更を保存'}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? '再提出中...' : '変更せずに再提出'}
              </Button>
            </div>

            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="w-full"
            >
              キャンセル
            </Button>
          </form>
        </Form>
      </>
    );
  }
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Toaster position="top-center" />
      {content}
    </div>
  );
}
