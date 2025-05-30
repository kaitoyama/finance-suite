'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useExpenseRequestById } from '@/hooks/useExpense';
import { useGetPresignedS3Url } from '@/hooks/useInvoice';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { PaymentAttachmentLinkRenderer } from '@/components/PaymentAttachmentLinkRenderer';

export default function ExpenseDetailPage() {
  const params = useParams();
  const id = params?.id ? parseInt(params.id as string, 10) : undefined;

  const [expenseQueryResult] = useExpenseRequestById({
    variables: { id: id! },
    pause: !id,
    requestPolicy: 'cache-and-network',
  });

  const { data: expenseData, fetching: loading, error } = expenseQueryResult;
  const expenseRequest = expenseData?.expenseRequest;

  const {
    presignedUrlData,
    fetchingUrl: fetchingPresignedUrl,
    fetchUrlError: presignedUrlError,
    retryFetchUrl: refetchPresignedUrl,
  } = useGetPresignedS3Url(expenseRequest?.attachment?.s3Key);

  if (!id) {
    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Expense ID is missing.</AlertDescription>
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
                <TableCell>{state}</TableCell>
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
                  {payment.attachments.map(actualAttachment => {
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

      <div className="flex justify-end mt-6">
        <Button variant="outline" asChild>
            <Link href="/expenses">Back to Expenses List</Link>
        </Button>
      </div>
    </div>
  );
}
