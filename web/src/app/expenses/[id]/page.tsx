'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useExpenseRequestDetailQuery } from '@/hooks/useExpenseRequestDetailQuery';
import { useGetPresignedS3Url } from '@/hooks/useInvoice';
import { useResubmitExpenseRequestMutation } from '@/hooks/useResubmitExpenseRequestMutation';
import { useApproveExpenseRequestMutation } from '@/hooks/useApproveExpenseRequestMutation';
import { useRejectExpenseRequestMutation } from '@/hooks/useRejectExpenseRequestMutation';
import { useUpdateExpenseRequestMutation } from '@/hooks/useUpdateExpenseRequestMutation';
import { useMeQuery } from '@/hooks/useMeQuery';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import Link from 'next/link';
import { PaymentAttachmentLinkRenderer } from '@/components/PaymentAttachmentLinkRenderer';
import toast, { Toaster } from 'react-hot-toast';

export default function ExpenseDetailPage() {
  const params = useParams();
  const idParam = params?.id as string;
  const id = idParam ? parseInt(idParam, 10) : 0;
  const [isResubmitting, setIsResubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | 'submit' | 'resubmit' | null>(null);

  const { data: expenseData, fetching: loading, error, refetch } = useExpenseRequestDetailQuery(id);
  const expenseRequest = expenseData;

  const { resubmitExpenseRequest } = useResubmitExpenseRequestMutation();
  const { approveExpenseRequest } = useApproveExpenseRequestMutation();
  const { rejectExpenseRequest } = useRejectExpenseRequestMutation();
  const { updateExpenseRequest } = useUpdateExpenseRequestMutation();
  const { user } = useMeQuery();
  const isAdmin = user?.isAdmin ?? false;

  const {
    presignedUrlData,
    fetchingUrl: fetchingPresignedUrl,
    fetchUrlError: presignedUrlError,
    retryFetchUrl: refetchPresignedUrl,
  } = useGetPresignedS3Url(expenseRequest?.attachment?.s3Key);

  // Generic confirmation dialog handler

  const handleActionClick = (action: 'approve' | 'reject' | 'submit' | 'resubmit') => {
    setDialogAction(action);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!id || !dialogAction) return;

    let actionPromise;
    let successMessage = '';

    switch (dialogAction) {
      case 'approve':
        actionPromise = approveExpenseRequest({ id });
        successMessage = '承認';
        break;
      case 'reject':
        actionPromise = rejectExpenseRequest({ id });
        successMessage = '差戻し';
        break;
      case 'submit':
        actionPromise = updateExpenseRequest({ id, input: { state: 'PENDING' } });
        successMessage = '申請';
        break;
      case 'resubmit':
        setIsResubmitting(true);
        actionPromise = resubmitExpenseRequest({ id });
        successMessage = '再申請';
        break;
      default:
        return;
    }

    const execPromise = actionPromise.then((res) => {
      if (res.error) {
        throw new Error(res.error.message || `Failed to ${dialogAction}`);
      }
      refetch({ requestPolicy: 'network-only' });
      setIsDialogOpen(false);
      setDialogAction(null);
      return `${successMessage}しました。`;
    });

    toast.promise(execPromise, {
      loading: `${successMessage}中...`,
      success: (message: string) => message,
      error: (err: Error) => `${successMessage}に失敗しました: ${err.message}`,
    }).finally(() => {
      if (dialogAction === 'resubmit') setIsResubmitting(false);
    });
  };

  const getStateBadgeVariant = (state: string) => {
    switch (state) {
      case 'PENDING':
        return 'default';
      case 'APPROVED':
        return 'secondary';
      case 'REJECTED':
        return 'destructive';
      case 'DRAFT':
        return 'outline';
      default:
        return 'default';
    }
  };

  if (!idParam || !id || isNaN(id) || id <= 0) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Expense ID is missing or invalid.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) return <div className="container mx-auto p-4">経費詳細を読み込み中...</div>;
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>経費情報の読み込みエラー</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!expenseRequest) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertTitle>見つかりません</AlertTitle>
          <AlertDescription>経費申請が見つかりません。</AlertDescription>
        </Alert>
      </div>
    );
  }

  const { amount, state, createdAt, approvedAt, requester, approver, payment, attachment } = expenseRequest;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Toaster position="top-center" />
      <Card>
        <CardHeader>
          <CardTitle>経費申請詳細</CardTitle>
          <CardDescription>申請ID: {id} の内容</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">金額</TableCell>
                <TableCell>{amount.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">状態</TableCell>
                <TableCell>
                  <Badge variant={getStateBadgeVariant(state)}>
                    {state}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">申請日</TableCell>
                <TableCell>{new Date(createdAt).toLocaleString()}</TableCell>
              </TableRow>
              {approvedAt && (
                <TableRow>
                  <TableCell className="font-medium">承認日</TableCell>
                  <TableCell>{new Date(approvedAt).toLocaleString()}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">申請者</TableCell>
                <TableCell>{requester.username} (ID: {requester.id})</TableCell>
              </TableRow>
              {approver && (
                <TableRow>
                  <TableCell className="font-medium">承認者</TableCell>
                  <TableCell>{approver.username} (ID: {approver.id})</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {attachment && (
        <Card>
          <CardHeader>
            <CardTitle>添付ファイル詳細</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">タイトル</TableCell>
                  <TableCell>{attachment.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">S3キー</TableCell>
                  <TableCell>{attachment.s3Key}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">添付金額</TableCell>
                  <TableCell>{attachment.amount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">ファイル</TableCell>
                  <TableCell>
                    {fetchingPresignedUrl && <p>リンクを生成中...</p>}
                    {presignedUrlError && <p className="text-red-500">エラー: {presignedUrlError.message}</p>}
                    {presignedUrlData?.url && (
                      <Button asChild variant="link">
                        <Link href={presignedUrlData.url} target="_blank" rel="noopener noreferrer">
                          添付を表示/ダウンロード
                        </Link>
                      </Button>
                    )}
                    {!presignedUrlData?.url && !fetchingPresignedUrl && (
                      <Button onClick={refetchPresignedUrl} variant="outline" size="sm">
                        リンクを生成
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {payment && (
        <Card>
          <CardHeader><CardTitle>支払詳細</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">支払ID</TableCell>
                  <TableCell>{payment.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">支払金額</TableCell>
                  <TableCell>{payment.amount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">支払日</TableCell>
                  <TableCell>{new Date(payment.paidAt).toLocaleString()}</TableCell>
                </TableRow>
                {payment.direction && (
                    <TableRow>
                        <TableCell className="font-medium">区分</TableCell>
                        <TableCell>{payment.direction}</TableCell>
                    </TableRow>
                )}
                {payment.method && (
                    <TableRow>
                        <TableCell className="font-medium">方法</TableCell>
                        <TableCell>{payment.method}</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
            {/* 支払添付ファイル */}
            {payment.attachments && payment.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">支払添付ファイル:</h4>
                <div className="space-y-4">
                  {payment.attachments.map((actualAttachment) => {
                    if (!actualAttachment) return null;
                    return (
                      <Card key={actualAttachment.id} className="p-4">
                        <p className="font-medium text-base">{actualAttachment.title}</p>
                        {actualAttachment.amount != null && (
                            <p className="text-sm text-muted-foreground">金額: {actualAttachment.amount.toLocaleString()}</p>
                        )}
                        <PaymentAttachmentLinkRenderer s3Key={actualAttachment.s3Key} title={actualAttachment.title} />
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between items-center mt-6">
        <div className="flex gap-3">
          {/* DRAFT状態: 申請提出ボタン */}
          {state === 'DRAFT' && (
            <Button variant="default" onClick={() => handleActionClick('submit')}>
              申請提出
            </Button>
          )}
          
          {/* PENDING状態: 承認・却下ボタン（管理者向け） */}
          {state === 'PENDING' && isAdmin && (
            <>
              <Button variant="default" onClick={() => handleActionClick('approve')}>
                承認
              </Button>
              <Button variant="destructive" onClick={() => handleActionClick('reject')}>
                差戻し
              </Button>
            </>
          )}
          
          {/* APPROVED状態: 支払いボタン */}
          {state === 'APPROVED' && (
            <Button asChild variant="default">
              <Link href={`/expenses/${id}/pay`}>支払処理</Link>
            </Button>
          )}
          
          {/* PAID状態: クローズボタン */}
          {state === 'PAID' && (
            <Button variant="outline">
              完了にする
            </Button>
          )}
          
          {/* REJECTED状態: 編集・再申請ボタン */}
          {state === 'REJECTED' && (
            <>
              <Button asChild variant="default">
                <Link href={`/expenses/${id}/edit`}>経費を編集</Link>
              </Button>
              <Button
                onClick={() => handleActionClick('resubmit')}
                disabled={isResubmitting}
                variant="outline"
              >
                {isResubmitting ? '再申請中...' : '再申請'}
              </Button>
            </>
          )}
          
          {/* CLOSED状態: アクションなし（最終状態） */}
        </div>
        <Button variant="outline" asChild>
          <Link href="/expenses">一覧へ戻る</Link>
        </Button>
      </div>
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認</AlertDialogTitle>
            <AlertDialogDescription>
              {`ID: ${id} の経費申請を${
                dialogAction === 'approve' ? '承認' :
                dialogAction === 'reject' ? '差戻し' :
                dialogAction === 'submit' ? '申請' :
                dialogAction === 'resubmit' ? '再申請' : ''
              }しますか？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction} disabled={dialogAction === 'resubmit' && isResubmitting}>
              {dialogAction === 'approve' ? '承認' :
               dialogAction === 'reject' ? '差戻し' :
               dialogAction === 'submit' ? '申請' :
               dialogAction === 'resubmit' ? (isResubmitting ? '再申請中...' : '再申請') : '実行'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Toaster />
    </div>
  );
}
