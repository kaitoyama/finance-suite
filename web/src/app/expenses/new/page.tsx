'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import toast, { Toaster } from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { useGetAccounts } from '@/hooks/useAccount'; // Assuming useAccountsQuery is the correct hook name
import { useCreateAttachment, useCreatePresignedPost } from '@/hooks/useAttachment';
import { CreateAttachmentInput, CreateExpenseRequestInput } from '@/gql/graphql'; // Import generated type

const expenseFormSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive' }),
  accountId: z.string().min(1, { message: 'Expense account is required' }), // Will be string from Select, convert to Int for mutation
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
      description: '',
    },
  });

  const { result: createResult, executeMutation: createExpenseRequest } = useCreateExpenseRequestMutation();
  const { accounts, loading: accountsLoading, error: accountsError } = useGetAccounts();
  const { createAttachment, loading: attachmentLoading, error: attachmentError } = useCreateAttachment();
  const { presignedPost, loading: presignedPostLoading, error: presignedPostError } = useCreatePresignedPost();

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

        // 2. Upload file directly to S3
        const formData = new FormData();
        fields.forEach(({ key, value }) => formData.append(key, value));
        formData.append('file', selectedFile, selectedFile.name);

        const s3UploadPromise = fetch(url, {
          method: 'POST',
          body: formData,
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
        attachmentId: finalAttachmentId
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

    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (accountsError) {
      toast.error(`Failed to load accounts: ${accountsError.message}`);
    }
  }, [accountsError]);

  return (
    <div className="container mx-auto py-10">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-8">Create New Expense Request</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount *</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} />
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
                <FormLabel>Expense Account (科目) *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={accountsLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accountsLoading ? (
                      <Skeleton className="h-8 w-full" />
                    ) : (
                      accounts?.map((account: { id: string; name: string; code?: string }) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.code ? `${account.code} - ` : ''}{account.name}
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
