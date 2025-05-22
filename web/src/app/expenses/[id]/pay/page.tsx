'use client';

import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { PaymentForm, PaymentMethod as FormPaymentMethod } from '@/components/PaymentForm';
import { 
  PaymentDirection, 
  CreatePaymentInput,
  PaymentMethod as GqlPaymentMethod,
} from '@/gql/graphql';
import { calcPaymentLabel, PaymentLabel as LocalPaymentLabel } from '@/lib/payment';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useExpenseRequestByIdQuery } from '@/hooks/useExpenseRequestByIdQuery';
import { useCreatePaymentMutation } from '@/hooks/useCreatePaymentMutation';

// Helper to map form's PaymentMethod to GraphQL's PaymentMethod enum
const mapFormMethodToGql = (method: FormPaymentMethod): GqlPaymentMethod => {
  return method as GqlPaymentMethod; 
};

// Define the type for values coming from PaymentForm more accurately
interface PaymentFormValues {
  paidAt: Date;
  amount: number;
  method: FormPaymentMethod;
  attachments: File[]; // Assuming PaymentForm provides files this way
}

export default function PayExpensePage() {
  const router = useRouter();
  const params = useParams();
  const expenseId = params.id as string;

  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningDialogContent, setWarningDialogContent] = useState({ title: '', description: '' });
  // Store the full CreatePaymentInput that would be sent after dialog confirmation
  const [paymentInputForDialog, setPaymentInputForDialog] = useState<CreatePaymentInput | null>(null);

  const { data: expenseData, fetching: fetchingExpense, error: expenseError } = useExpenseRequestByIdQuery(parseInt(expenseId, 10));
  const { loading: creatingPayment, error: paymentError, createPayment } = useCreatePaymentMutation();

  const handleFormSubmit = async (values: PaymentFormValues) => { 
    if (!expenseData?.expenseRequest) {
      toast.error('経費情報が見つかりません。');
      return;
    }

    const effectiveLabel = calcPaymentLabel(values.amount, expenseData.expenseRequest.amount);
    
    // TODO: Implement actual attachment upload logic here
    // For now, we'll prepare an empty array for attachmentIds
    // const uploadedAttachmentIds = await uploadFilesAndGetIds(values.attachments);
    const uploadedAttachmentIds: number[] = []; 

    const currentPaymentInput: CreatePaymentInput = {
        amount: values.amount,
        paidAt: values.paidAt.toISOString().split('T')[0], 
        direction: "OUT" as PaymentDirection, // Using string literal and casting
        method: mapFormMethodToGql(values.method),
        expenseRequestId: parseInt(expenseId, 10),
        // label is NOT part of CreatePaymentInput according to schema
        attachmentIds: uploadedAttachmentIds, 
    };
    setPaymentInputForDialog(currentPaymentInput);

    if (effectiveLabel === 'PARTIAL') {
      setWarningDialogContent({
        title: '支払額確認',
        description: `支払額 (${values.amount.toLocaleString()}円) が経費申請額 (${expenseData.expenseRequest.amount.toLocaleString()}円) より少ないですが、この内容で登録しますか？`,
      });
      setShowWarningDialog(true);
      return; 
    } else if (effectiveLabel === 'OVERPAY') {
      setWarningDialogContent({
        title: '支払額確認',
        description: `支払額 (${values.amount.toLocaleString()}円) が経費申請額 (${expenseData.expenseRequest.amount.toLocaleString()}円) を超過しています。この内容で登録しますか？`,
      });
      setShowWarningDialog(true);
      return; 
    }

    await processPaymentSubmission(currentPaymentInput);
  };

  const processPaymentSubmission = async (paymentInput: CreatePaymentInput) => {
    if (!expenseData?.expenseRequest) return;

    try {
      const result = await createPayment(paymentInput); 
      if (result) { 
        toast.success('支払いが正常に登録されました。');
        router.push(`/expenses/${expenseData.expenseRequest.id}`); 
      } else {
         toast.error('支払登録に失敗しました。レスポンスデータがありません。');
      }
    } catch (e: any) {
      console.error('Payment submission error:', e);
      toast.error(e.message || '支払登録中にエラーが発生しました。');
    }
    setShowWarningDialog(false); 
  };

  const handleDialogConfirm = () => {
    if (paymentInputForDialog) {
      processPaymentSubmission(paymentInputForDialog);
    }
    setShowWarningDialog(false);
  };

  const handleDialogCancel = () => {
    setShowWarningDialog(false);
  };

  useEffect(() => {
    if (paymentError) {
      toast.error(paymentError.message || '支払処理でエラーが発生しました。');
    }
  }, [paymentError]);

  if (fetchingExpense) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-12 w-1/2 mb-6" />
        <div className="space-y-8">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          <div className="flex justify-end space-x-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (expenseError) {
    toast.error(`経費情報の読み込みエラー: ${expenseError.message}`);
    return <p className="text-red-500 p-4">エラー: {expenseError.message}</p>;
  }

  if (!expenseData?.expenseRequest) {
    return <p className="p-4">経費申請が見つかりません。</p>;
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">
          経費支払登録 (ID: {expenseData.expenseRequest.id})
        </h1>
        <p className="text-sm text-gray-600 mb-1">申請者: {expenseData.expenseRequest.requester?.name || 'N/A'}</p>
        <p className="text-sm text-gray-600">現在の状態: {expenseData.expenseRequest.status || 'N/A'}</p>
      </header>

      <PaymentForm
        expenseAmount={expenseData.expenseRequest.amount} 
        expenseId={expenseId}
        onSubmit={handleFormSubmit as any} // Still using 'as any' due to PaymentForm's generic values.
                                        // Ideally, PaymentForm's onSubmit should expect PaymentFormValues.
        onCancel={() => router.back()}
        isLoading={creatingPayment}
      />

      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{warningDialogContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {warningDialogContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDialogCancel}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDialogConfirm}>登録する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 