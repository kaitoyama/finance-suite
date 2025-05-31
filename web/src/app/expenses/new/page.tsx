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
  accountId: z.string().min(1, { message: '勘定科目の選択は必須です' }),
  categoryId: z.string().min(1, { message: 'カテゴリの選択は必須です' }),
  description: z.string().optional(),
  attachment: z.instanceof(File).optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export default function NewExpenseRequestPage() {
  const router = useRouter();
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: 0,
      accountId: '',
      categoryId: '',
      description: '',
    },
  });

  const { executeMutation: createExpenseRequest } = useCreateExpenseRequestMutation();
  const { categories, loading: categoriesLoading, error: categoriesError } = useGetCategories();
  const { accounts, loading: accountsLoading, error: accountsError } = useGetAccounts();
  const { createAttachment } = useCreateAttachment();
  const { presignedPost, error: presignedPostError } = useCreatePresignedPost();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      form.setValue('attachment', event.target.files[0]);
    }
  };

  const onSubmit = async (values: ExpenseFormValues) => {
    setIsSubmitting(true);
    let finalAttachmentId: number | null = null;

    try {
      if (selectedFile) {
        const s3Key = `${self.crypto.randomUUID()}-${selectedFile.name}`;

        // 1. Get presigned URL for S3 upload
        const presignedPostResult = await presignedPost(s3Key);

        if (presignedPostError || !presignedPostResult) {
          throw new Error(presignedPostError?.message || 'Failed to get upload URL.');
        }

        const { url, fields } = presignedPostResult;

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
              const errorText = await s3Response.text();
              throw new Error(`S3 Upload Failed: ${s3Response.status} ${errorText}`);
            }
            return "File uploaded to S3!";
          }),
          {
            loading: 'Uploading attachment to S3...',
            success: (message) => message,
            error: (err) => `Attachment S3 upload failed: ${err.message}`,
          }
        );

        // 3. Create attachment record in database
        // Ensure the createAttachment mutation input matches your backend schema
        const attachmentInput: CreateAttachmentInput = {
          s3Key,
          title: selectedFile.name,
          amount: values.amount, // Consider if amount is correct here or part of expense only
        };
        const createAttachmentPromise = createAttachment(attachmentInput);

        await toast.promise(
          createAttachmentPromise.then(dbRes => {
            if (!dbRes || !dbRes.id) { 
              throw new Error('Attachment ID not found after DB save.');
            }
            finalAttachmentId = dbRes.id;
            return "Attachment metadata saved!";
          }),
          {
            loading: 'Saving attachment details...',
            success: (message) => message,
            error: (err) => `Saving attachment failed: ${err.message}`,
          }
        );
      }

      if (finalAttachmentId===null) {
        throw new Error('Attachment ID not found after DB save.');
      }

      // 4. Submit expense request
      const expenseInput: CreateExpenseRequestInput = {
        amount: values.amount,
        attachmentId: finalAttachmentId,
        accountId: values.accountId ? parseInt(values.accountId, 10) : undefined,
        categoryId: values.categoryId ? parseInt(values.categoryId, 10) : undefined,
        description: values.description || undefined,
      };
      const submissionPromise = createExpenseRequest({ input: expenseInput });

      await toast.promise(
        submissionPromise.then(res => {
          if (res.error) throw new Error(res.error.message);
          if (!res.data?.submitExpenseRequest?.id) throw new Error('Failed to create expense request.');
          form.reset();
          setSelectedFile(null);
          // router.push('/expenses'); // Or to the detail page: /expenses/${res.data.submitExpenseRequest.id}
          router.push('/expenses'); // Placeholder redirect
          return 'Expense request created successfully!';
        }),
        {
          loading: 'Submitting expense request...',
          success: (message) => message,
          error: (err) => `Submission failed: ${err.message}`,
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
    if (accountsError) {
      toast.error(`勘定科目の読み込みに失敗しました: ${accountsError.message}`);
    }
  }, [categoriesError, accountsError]);

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

          <FormField
            control={form.control}
            name="accountId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>勘定科目 *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={accountsLoading}>
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
              <Input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" />
            </FormControl>
            {selectedFile && <FormDescription>Selected file: {selectedFile.name}</FormDescription>}
            <FormMessage />
          </FormItem>

          <Button type="submit" disabled={isSubmitting || accountsLoading} className="w-full md:w-auto">
            {isSubmitting ? 'Submitting...' : 'Submit Expense Request'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
