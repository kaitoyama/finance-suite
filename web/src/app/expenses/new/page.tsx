'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

import { useCreateExpenseRequestMutation } from '@/hooks/useCreateExpenseRequestMutation';
import { useGetCategories } from '@/hooks/useCategory';
import { useGetAccounts } from '@/hooks/useAccount';
import { useCreateAttachment, useCreatePresignedPost } from '@/hooks/useAttachment';
import { CreateAttachmentInput, CreateExpenseRequestInput } from '@/gql/graphql'; // Import generated type

const expenseFormSchema = z.object({
  amount: z.coerce.number().int().positive({ message: 'Amount must be an integer and positive' }),
  categoryId: z.string().min(1, { message: 'カテゴリの選択は必須です' }),
  description: z.string().optional(),
  attachments: z.array(z.instanceof(File)).min(1, { message: '少なくとも1つの証憑ファイルを選択してください' }),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function NewExpenseRequestPage() {
  const router = useRouter();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: 0,
      categoryId: '',
      description: '',
      attachments: [],
    },
  });

  const { executeMutation: createExpenseRequest } = useCreateExpenseRequestMutation();
  const { categories, loading: categoriesLoading, error: categoriesError } = useGetCategories();
  const { accounts } = useGetAccounts();
  const { createAttachment } = useCreateAttachment();
  const { presignedPost, error: presignedPostError } = useCreatePresignedPost();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      setSelectedFiles(files);
      form.setValue('attachments', files);
    }
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    setIsSubmitting(true);
    const attachmentIds: number[] = [];

    try {
      for (const file of selectedFiles) {
        const s3Key = `${self.crypto.randomUUID()}-${file.name}`;

        // 1. Get presigned URL for S3 upload
        const presignedPostResult = await presignedPost(s3Key);

        if (presignedPostError || !presignedPostResult) {
          throw new Error(presignedPostError?.message || 'Failed to get upload URL.');
        }

        const { url } = presignedPostResult;

        // 2. Upload file directly to R2 using presigned PUT
        const s3UploadPromise = fetch(url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type || 'application/octet-stream'
          }
        });

        await toast.promise(
          s3UploadPromise.then(async (s3Response) => {
            if (!s3Response.ok) {
              const errorText = await s3Response.text();
              throw new Error(`S3 Upload Failed: ${s3Response.status} ${errorText}`);
            }
            return "S3へのアップロード完了";
          }),
          {
            loading: '添付ファイルをS3にアップロード中...',
            success: (message) => message,
            error: (err) => `S3アップロード失敗: ${err.message}`,
          }
        );

        // 3. Create attachment record in database
        // Ensure the createAttachment mutation input matches your backend schema
        const attachmentInput: CreateAttachmentInput = {
          s3Key,
          title: file.name,
          amount: values.amount,
        };
        const createAttachmentPromise = createAttachment(attachmentInput);

        await toast.promise(
          createAttachmentPromise.then(dbRes => {
            if (!dbRes || !dbRes.id) { 
              throw new Error('Attachment ID not found after DB save.');
            }
            attachmentIds.push(dbRes.id);
            return "添付情報を保存しました";
          }),
          {
            loading: '添付情報を保存中...',
            success: (message) => message,
            error: (err) => `添付情報の保存に失敗: ${err.message}`,
          }
        );
      }

      if (attachmentIds.length === 0) {
        throw new Error('Attachment upload failed');
      }

      // 4. Submit expense request
      // 一般経費の勘定科目IDを取得（501番の勘定科目）
      const generalExpenseAccount = accounts?.find(account => account.code === '501');
      const expenseInput: CreateExpenseRequestInput = {
        amount: values.amount,
        attachmentIds,
        accountId: generalExpenseAccount?.id ? parseInt(generalExpenseAccount.id.toString(), 10) : undefined,
        categoryId: values.categoryId ? parseInt(values.categoryId, 10) : undefined,
        description: values.description || undefined,
      };
      const submissionPromise = createExpenseRequest({ input: expenseInput });

      await toast.promise(
        submissionPromise.then(res => {
          if (res.error) throw new Error(res.error.message);
          if (!res.data?.submitExpenseRequest?.id) throw new Error('Failed to create expense request.');
          form.reset();
          setSelectedFiles([]);
          // router.push('/expenses'); // Or to the detail page: /expenses/${res.data.submitExpenseRequest.id}
          router.push('/expenses'); // Placeholder redirect
          return '経費申請が作成されました';
        }),
        {
          loading: '経費申請を送信中...',
          success: (message) => message,
          error: (err) => `送信に失敗しました: ${err.message}`,
        }
      );

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during submission.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (categoriesError) {
      toast.error(`カテゴリの読み込みに失敗しました: ${categoriesError.message}`);
    }
  }, [categoriesError]);

  return (
    <div className="container mx-auto py-10">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-8">新規経費申請</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>金額 * (円)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0"
                    step="1"
                    {...field} 
                    onChange={event => field.onChange(parseInt(event.target.value, 10) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />


          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>勘定科目:</strong> 一般経費（自動選択）
            </p>
            <p className="text-xs text-blue-600 mt-1">
              すべての経費は自動的に「501 - 一般経費」として処理されます
            </p>
          </div>

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>カテゴリ *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={categoriesLoading}>
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
                <FormLabel>Description (摘要)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter a description for the expense..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormItem>
            <FormLabel>Attachment (証憑)</FormLabel>
            <FormControl>
              <Input type="file" multiple onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            </FormControl>
            {selectedFiles.length > 0 && (
              <FormDescription>
                選択されたファイル: {selectedFiles.map(f => f.name).join(', ')}
              </FormDescription>
            )}
            <FormMessage />
          </FormItem>

          <Button type="submit" disabled={isSubmitting || categoriesLoading} className="w-full md:w-auto">
            {isSubmitting ? '送信中...' : '経費申請を送信'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
