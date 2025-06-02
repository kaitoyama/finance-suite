'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
  CreatePaymentInput,
  PaymentMethod as GqlPaymentMethod,
  CreateAttachmentInput,
} from '@/gql/graphql';
import { useCreatePaymentMutation } from '@/hooks/useCreatePaymentMutation';
import { useExpenseRequestByIdQuery } from '@/hooks/useExpenseRequestByIdQuery';
import { useCreateAttachment, useCreatePresignedPost } from '@/hooks/useAttachment';
import { PaymentForm } from '@/components/PaymentForm'; // Assuming PaymentForm handles its own state/validation for method
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Temporarily removing Zod schema for simplicity
// const paymentFormSchema = z.object({ ... });

// type PaymentFormValues = z.infer<typeof paymentFormSchema> & { amount: number; };
// Assuming PaymentFormValues will be a simpler type provided by PaymentForm or defined manually
interface PaymentFormSubmitValues {
  paidAt: Date;
  method: GqlPaymentMethod;
  attachments?: File[]; // Assuming PaymentForm will provide this
}

export default function PayExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params?.id as string;
  const numericId = expenseId ? parseInt(expenseId, 10) : undefined;

  // The hook expects a number. We rely on rendering logic to handle cases where numericId is undefined.
  // The `!` tells TypeScript that we are sure `numericId` will be a number when the hook actually executes
  // in a way that matters (e.g. fetches data), or that the hook itself can handle being called with an ID that might
  // temporarily be undefined if it has internal pausing based on a falsy ID (less common for simple hooks).
  // Given the strict 'number' requirement, the component's later checks for `!numericId` are key.
  const { data: expenseData, fetching: expenseLoading, error: expenseError } =
    useExpenseRequestByIdQuery(numericId!);

  const { 
    loading: paymentFetching,         // Correct: object has 'loading', alias to 'paymentFetching'
    error: paymentErrorState,           // Correct: object has 'error', alias to 'paymentErrorState'
    createPayment: executeCreatePayment // Correct: object has 'createPayment', alias to 'executeCreatePayment'
  } = useCreatePaymentMutation();
  const { createAttachment } = useCreateAttachment();
  const { presignedPost } = useCreatePresignedPost();

  const handleFormSubmit = async (values: PaymentFormSubmitValues) => { 
    if (!expenseData || !numericId) {
      toast.error('Expense data not loaded or ID missing.');
      return;
    }

    // Use files from `values.attachments` provided by PaymentForm
    const filesToUpload = values.attachments || [];

    if (filesToUpload.length === 0) { 
      toast.error('証憑ファイルを添付してください。');
      return;
    }

    const uploadedAttachmentIds: number[] = [];
    for (const file of filesToUpload) { // Iterate over filesFromForm
        try {
          const s3Key = `${self.crypto.randomUUID()}-${file.name}`;
          const presignedPostResult = await presignedPost(s3Key);
          if (!presignedPostResult) throw new Error('Failed to get S3 presigned post.');
          const s3Response = await fetch(presignedPostResult.url, { 
            method: 'PUT', 
            body: file,
            headers: {
              'Content-Type': file.type || 'application/octet-stream'
            }
          });
          if (!s3Response.ok) {
            const errorText = await s3Response.text();
            throw new Error(`S3 Upload Failed: ${s3Response.status} ${errorText}`);
          }
          const attachmentInput: CreateAttachmentInput = {
            s3Key,
            title: file.name,
            amount: expenseData.amount,
          };
          const dbAttachment = await createAttachment(attachmentInput);
          if (!dbAttachment || !dbAttachment.id) throw new Error('Failed to save attachment to DB.');
          uploadedAttachmentIds.push(dbAttachment.id);
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          toast.error(`Attachment upload failed for ${file.name}: ${errorMessage}`);
          return; 
        }
      }
    if (uploadedAttachmentIds.length > 0) { // Only toast if attachments were processed
        toast.success(`${uploadedAttachmentIds.length} attachment(s) processed.`);
    }

    const paymentInput: CreatePaymentInput = {
      paidAt: values.paidAt.toISOString(),
      amount: expenseData.amount,
      direction: 'OUT', 
      method: values.method, 
      expenseRequestId: numericId,
      invoiceId: undefined,
      attachmentIds: uploadedAttachmentIds, 
    };

    try {
      const result = await executeCreatePayment(paymentInput);
      if (result.error) throw result.error;
      if (!result?.id) throw new Error('Failed to register payment.');
      toast.success('支払いが正常に登録されました。');
      router.push(`/expenses/${expenseData.id}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`支払登録エラー: ${errorMessage}`);
    }
  };
  
  useEffect(() => {
    if (paymentErrorState) {
      toast.error(paymentErrorState.message || '支払処理でエラーが発生しました。');
    }
  }, [paymentErrorState]);

  if (expenseLoading || !numericId) return <div className="container mx-auto p-4">Loading...</div>;
  if (expenseError) return <div className="container mx-auto p-4">Error loading expense: {expenseError.message}</div>;
  if (!expenseData) return <div className="container mx-auto p-4">Expense not found.</div>;

  // Prevent payment if not APPROVED, with specific messages for other states
  if (expenseData.state !== 'APPROVED') {
    let message = 'この経費申請は現在支払処理を行えません。'; // Default message
    const currentState = expenseData.state;

    switch (currentState) {
      case 'PAID':
        message = 'この経費申請は既に支払済みです。';
        break;
      case 'REJECTED':
        message = 'この経費申請は差戻しされています。内容を確認し、必要であれば再申請してください。';
        break;
      case 'PENDING':
        message = 'この経費申請は現在承認待ちです。承認後に支払処理が可能になります。';
        break;
      case 'DRAFT':
        message = 'この経費申請は下書き状態です。申請を提出してください。';
        break;
      case 'CLOSED':
        message = 'この経費申請はクローズされています。';
        break;
      default:
        // Keep the default message or handle unknown states
        message = `現在のステータス「${currentState}」では支払処理を行えません。`;
        break;
    }

    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Alert variant="default"> {/* Consider using variant="destructive" for REJECTED or other terminal states */}
          <AlertTitle>支払不可</AlertTitle>
          <AlertDescription>
            {message}
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.back()} className="mt-4">戻る</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Toaster position="top-center" />
      <h1 className="text-2xl font-bold mb-4">経費支払</h1>
      <div className="mb-6 p-4 border rounded-md">
        <h2 className="text-lg font-semibold mb-2">経費情報</h2>
        <p>ID: {expenseData.id}</p>
        <p>申請者: {expenseData.requester.username}</p>
        <p>金額: {expenseData.amount.toLocaleString()} 円</p>
        <p>ステータス: {expenseData.state}</p>
      </div>

      <PaymentForm 
        onSubmit={handleFormSubmit} 
        onCancel={() => router.back()}
        isLoading={paymentFetching}
        expenseAmount={expenseData.amount}
        expenseId={expenseData.id.toString()}
      />
    </div>
  );
} 