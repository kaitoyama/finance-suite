'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useExpenseRequestDetailQuery } from '@/hooks/useExpenseRequestDetailQuery';
import { useGetPresignedS3Url } from '@/hooks/useInvoice';
import { useResubmitExpenseRequestMutation } from '@/hooks/useResubmitExpenseRequestMutation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { PaymentAttachmentLinkRenderer } from '@/components/PaymentAttachmentLinkRenderer';
import toast, { Toaster } from 'react-hot-toast';

export default function ExpenseDetailPage() {
  const params = useParams();
  const idParam = params?.id as string;
  const id = idParam ? parseInt(idParam, 10) : 0;
  const [isResubmitting, setIsResubmitting] = useState(false);

  const { data: expenseData, fetching: loading, error } = useExpenseRequestDetailQuery(id);
  const expenseRequest = expenseData;

  const { resubmitExpenseRequest } = useResubmitExpenseRequestMutation();

  const {
    presignedUrlData,
    fetchingUrl: fetchingPresignedUrl,
    fetchUrlError: presignedUrlError,
    retryFetchUrl: refetchPresignedUrl,
  } = useGetPresignedS3Url(expenseRequest?.attachment?.s3Key);

  const handleResubmit = async () => {
    if (!id) return;
    
    setIsResubmitting(true);
    try {
      const result = await resubmitExpenseRequest({ id });
      if (result.error) {
        throw new Error(result.error.message);
      }
      toast.success('Expense request resubmitted successfully!');
      // Refresh the expense data to show updated state
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resubmit expense request';
      toast.error(errorMessage);
    } finally {
      setIsResubmitting(false);
    }
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

  if (loading) return <div className="container mx-auto p-4">Loading expense details...</div>;
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error Loading Expense</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!expenseRequest) {
    return (
      <div className="container mx-auto p-4">
        <Alert>
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Expense request not found.</AlertDescription>
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
          <CardTitle>Expense Request Details</CardTitle>
          <CardDescription>Viewing expense ID: {id}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Amount</TableCell>
                <TableCell>{amount.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">State</TableCell>
                <TableCell>
                  <Badge variant={getStateBadgeVariant(state)}>
                    {state}
                  </Badge>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Created At</TableCell>
                <TableCell>{new Date(createdAt).toLocaleString()}</TableCell>
              </TableRow>
              {approvedAt && (
                <TableRow>
                  <TableCell className="font-medium">Approved At</TableCell>
                  <TableCell>{new Date(approvedAt).toLocaleString()}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">Requester</TableCell>
                <TableCell>{requester.username} (ID: {requester.id})</TableCell>
              </TableRow>
              {approver && (
                <TableRow>
                  <TableCell className="font-medium">Approver</TableCell>
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
            <CardTitle>Attachment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Title</TableCell>
                  <TableCell>{attachment.title}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">S3 Key</TableCell>
                  <TableCell>{attachment.s3Key}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Attachment Amount</TableCell>
                  <TableCell>{attachment.amount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">File</TableCell>
                  <TableCell>
                    {fetchingPresignedUrl && <p>Loading link...</p>}
                    {presignedUrlError && <p className="text-red-500">Error: {presignedUrlError.message}</p>}
                    {presignedUrlData?.url && (
                      <Button asChild variant="link">
                        <Link href={presignedUrlData.url} target="_blank" rel="noopener noreferrer">
                          View/Download Attachment
                        </Link>
                      </Button>
                    )}
                    {!presignedUrlData?.url && !fetchingPresignedUrl && (
                      <Button onClick={refetchPresignedUrl} variant="outline" size="sm">
                        Generate Link
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
          <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Payment ID</TableCell>
                  <TableCell>{payment.id}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Payment Amount</TableCell>
                  <TableCell>{payment.amount.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Paid At</TableCell>
                  <TableCell>{new Date(payment.paidAt).toLocaleString()}</TableCell>
                </TableRow>
                {payment.direction && (
                    <TableRow>
                        <TableCell className="font-medium">Direction</TableCell>
                        <TableCell>{payment.direction}</TableCell>
                    </TableRow>
                )}
                {payment.method && (
                    <TableRow>
                        <TableCell className="font-medium">Method</TableCell>
                        <TableCell>{payment.method}</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
            {/* Display Payment Attachments if any */}
            {payment.attachments && payment.attachments.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">Payment Attachments:</h4>
                <div className="space-y-4">
                  {payment.attachments.map((actualAttachment: any) => {
                    if (!actualAttachment) return null;
                    return (
                      <Card key={actualAttachment.id} className="p-4">
                        <p className="font-medium text-base">{actualAttachment.title}</p>
                        {actualAttachment.amount != null && (
                            <p className="text-sm text-muted-foreground">Amount: {actualAttachment.amount.toLocaleString()}</p>
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
            <Button variant="default">
              Submit Request
            </Button>
          )}
          
          {/* PENDING状態: 承認・却下ボタン（管理者向け） */}
          {state === 'PENDING' && (
            <>
              <Button variant="default">
                Approve
              </Button>
              <Button variant="destructive">
                Reject
              </Button>
            </>
          )}
          
          {/* APPROVED状態: 支払いボタン */}
          {state === 'APPROVED' && (
            <Button asChild variant="default">
              <Link href={`/expenses/${id}/pay`}>Pay Expense</Link>
            </Button>
          )}
          
          {/* PAID状態: クローズボタン */}
          {state === 'PAID' && (
            <Button variant="outline">
              Close Request
            </Button>
          )}
          
          {/* REJECTED状態: 編集・再申請ボタン */}
          {state === 'REJECTED' && (
            <>
              <Button asChild variant="default">
                <Link href={`/expenses/${id}/edit`}>Edit Expense</Link>
              </Button>
              <Button 
                onClick={handleResubmit} 
                disabled={isResubmitting}
                variant="outline"
              >
                {isResubmitting ? 'Resubmitting...' : 'Resubmit'}
              </Button>
            </>
          )}
          
          {/* CLOSED状態: アクションなし（最終状態） */}
        </div>
        <Button variant="outline" asChild>
          <Link href="/expenses">Back to Expenses List</Link>
        </Button>
      </div>
      <Toaster />
    </div>
  );
}
