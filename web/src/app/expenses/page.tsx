'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpenseRequestsListQuery } from '@/hooks/useExpenseRequestsListQuery'; 
import { useApproveExpenseRequestMutation } from '@/hooks/useApproveExpenseRequestMutation';
import { useRejectExpenseRequestMutation } from '@/hooks/useRejectExpenseRequestMutation';
import { useUpdateExpenseRequestMutation } from '@/hooks/useUpdateExpenseRequestMutation';
import { useResubmitExpenseRequestMutation } from '@/hooks/useResubmitExpenseRequestMutation';
import { useMeQuery } from '@/hooks/useMeQuery';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table'; 
import { ColumnDef } from "@tanstack/react-table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import toast, { Toaster } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { Plus } from 'lucide-react';
import Link from 'next/link';

// Define a more specific type for the requester based on what's used.
interface RequesterInfo {
    __typename?: 'User';
    id: string; // Or number, depending on your schema
    username: string;
}

// Interface for data used in the DataTable
interface ExpenseRequestForTable {
  __typename?: 'ExpenseRequest';
  id: number;
  requester?: RequesterInfo | null; // Make requester optional to handle potential nulls from GQL
  amount: number;
  createdAt: string; // GQL DateTime usually comes as ISO string
  state: string; // Assuming state is always a string e.g. PENDING, APPROVED
  attachmentId?: number | null; // ID of the attachment, GraphQL schema shows this as number
  // attachmentCount?: number; // If you have a specific field for this
}

const AdminExpensesPage = () => {
  const router = useRouter();
  const { data, fetching, error, refetch } = useExpenseRequestsListQuery();
  const { approveExpenseRequest } = useApproveExpenseRequestMutation();
  const { rejectExpenseRequest } = useRejectExpenseRequestMutation();
  const { updateExpenseRequest } = useUpdateExpenseRequestMutation();
  const { resubmitExpenseRequest } = useResubmitExpenseRequestMutation();
  const { user } = useMeQuery();
  const isAdmin = user?.isAdmin ?? false;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | 'submit' | 'edit' | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(`経費データの取得に失敗しました: ${error.message}`);
    }
  }, [error]);

  const handleActionClick = (id: number, action: 'approve' | 'reject' | 'submit' | 'edit') => {
    setSelectedExpenseId(id);
    setDialogAction(action);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedExpenseId || !dialogAction) return;

    let actionPromise;
    let successMessage = '';

    switch (dialogAction) {
      case 'approve':
        actionPromise = approveExpenseRequest({ id: selectedExpenseId });
        successMessage = '承認';
        break;
      case 'reject':
        actionPromise = rejectExpenseRequest({ id: selectedExpenseId });
        successMessage = '差戻し';
        break;
      case 'submit':
        actionPromise = updateExpenseRequest({ 
          id: selectedExpenseId, 
          input: { state: 'PENDING' } 
        });
        successMessage = '申請';
        break;
      case 'edit':
        actionPromise = resubmitExpenseRequest({ id: selectedExpenseId });
        successMessage = '再申請';
        break;
      default:
        return;
    }

    toast.promise(
      actionPromise.then((res) => {
        if (res.error) {
          throw new Error(res.error.message || `Failed to ${dialogAction}`);
        }
        refetch({ requestPolicy: 'network-only' }); 
        setIsDialogOpen(false);
        setSelectedExpenseId(null);
        setDialogAction(null);
        return `${successMessage}しました。`;
      }),
      {
        loading: `${successMessage}中...`,
        success: (message: string) => message,
        error: (err: Error) => `${successMessage}に失敗しました: ${err.message}`,
      }
    );
  };

  // Using `any` for row in cell definitions to bypass complex type inference issues with DataTable for now.
  const columns: ColumnDef<ExpenseRequestForTable>[] = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    {
      accessorKey: 'requester.username',
      header: '申請者',
      cell: ({ row }: { row: { original: ExpenseRequestForTable } }) => row.original.requester?.username || 'N/A',
    },
    {
        accessorKey: 'amount',
        header: '金額',
        cell: ({ row }: { row: { original: ExpenseRequestForTable } }) => `¥${row.original.amount.toLocaleString()}`,
    },
    {
        accessorKey: 'attachmentId',
        header: '添付ファイル数',
        cell: ({ row }: { row: { original: ExpenseRequestForTable } }) => (row.original.attachmentId ? '1' : '0'),
    },
    {
        accessorKey: 'createdAt',
        header: '申請日',
        cell: ({ row }: { row: { original: ExpenseRequestForTable } }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
        accessorKey: 'state',
        header: '状態',
        cell: ({ row }: { row: { original: ExpenseRequestForTable } }) => <Badge variant={row.original.state === 'PENDING' ? 'default' : 'secondary'}>{row.original.state}</Badge>
    },
    {
        id: 'actions',
        header: 'アクション',
        cell: ({ row }: { row: { original: ExpenseRequestForTable } }) => {
            const { state, id } = row.original;
            
            const renderActionButtons = () => {
                switch (state) {
                    case 'DRAFT':
                        return (
                            <Button 
                                variant="default" 
                                size="sm" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleActionClick(id, 'submit');
                                }}
                            >
                                申請
                            </Button>
                        );
                    
                   case 'PENDING':
                        if (!isAdmin) return null;
                        return (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActionClick(id, 'approve');
                                    }}
                                >
                                    承認
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleActionClick(id, 'reject');
                                    }}
                                >
                                    差戻し
                                </Button>
                            </>
                        );
                    
                    case 'APPROVED':
                        return (
                            <Button 
                                variant="default" 
                                size="sm" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    router.push(`/expenses/${id}/pay`);
                                }}
                            >
                                承認済み
                            </Button>
                        );
                    
                    case 'PAID':
                        return (
                            <Badge variant="outline">支払済み</Badge>
                        );
                    
                    case 'REJECTED':
                        return (
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={(e) => { 
                                    e.stopPropagation(); 
                                    handleActionClick(id, 'edit');
                                }}
                            >
                                再申請
                            </Button>
                        );
                    
                    case 'CLOSED':
                        return (
                            <Badge variant="secondary">完了</Badge>
                        );
                    
                    default:
                        return null;
                }
            };

            return (
                <div className="space-x-2 flex items-center">
                    {renderActionButtons()}
                </div>
            );
        },
    },
  ], [router, isAdmin]);

  if (fetching && !data) {
    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-4">未承認経費一覧</h1>
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-96 w-full" />
        </div>
    );
  }

  // Data for PENDING expenses table (existing logic)
  const pendingTableData: ExpenseRequestForTable[] = (data || [])
    .filter((req): req is NonNullable<typeof req> & { state: 'PENDING' } => {
        if (!req) return false;
        return req.state === 'PENDING';
    })
    .map((req) => ({
      __typename: req.__typename,
      id: req.id,
      requester: req.requester ? { 
        __typename: req.requester.__typename, 
        id: String(req.requester.id), 
        username: req.requester.username 
      } : null,
      amount: req.amount,
      createdAt: req.createdAt,
      state: req.state as string,
      attachmentId: req.attachment.id
    }));

  // Data for ALL expenses table (new logic)
  const allTableData: ExpenseRequestForTable[] = (data || [])
    .filter((req): req is NonNullable<typeof req> => {
        return req !== null && req !== undefined;
    })
    .map((req) => ({
      __typename: req.__typename,
      id: req.id,
      requester: req.requester ? { 
        __typename: req.requester.__typename, 
        id: String(req.requester.id), 
        username: req.requester.username 
      } : null,
      amount: req.amount,
      createdAt: req.createdAt,
      state: req.state as string,
      attachmentId: req.attachment.id
    }));

  return (
    <div>
      <PageHeader
        title="経費申請管理"
        description="経費申請の承認・管理を行います"
        actions={
          <Link href="/expenses/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新規経費申請
            </Button>
          </Link>
        }
      />
      
      <Toaster position="top-center" />
      
      <div className="space-y-8">
        {/* Pending Expenses Table (existing) */}
        <div>
          <h2 className="text-xl font-semibold mb-4">未承認経費一覧</h2>
        <DataTable<ExpenseRequestForTable, ExpenseRequestForTable>
          columns={columns} // Reusing columns for now
          data={pendingTableData}
          onRowClick={(row: { original: ExpenseRequestForTable }) => { 
            if (row.original.id) { 
               router.push(`/expenses/${row.original.id}`);
            }
          }}
        />
      </div>

        {/* All Expenses Table (new) */}
        <div>
          <h2 className="text-xl font-semibold mb-4">全経費一覧</h2>
        <DataTable<ExpenseRequestForTable, ExpenseRequestForTable>
          columns={columns} // Reusing columns for now, can be customized
          data={allTableData}
          onRowClick={(row: { original: ExpenseRequestForTable }) => { 
            if (row.original.id) { 
               router.push(`/expenses/${row.original.id}`);
            }
          }}
        />
        </div>
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認</AlertDialogTitle>
            <AlertDialogDescription>
              {`ID: ${selectedExpenseId} の経費申請を${
                dialogAction === 'approve' ? '承認' :
                dialogAction === 'reject' ? '差戻し' :
                dialogAction === 'submit' ? '申請' :
                dialogAction === 'edit' ? '再申請' : ''
              }しますか？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {dialogAction === 'approve' ? '承認' :
               dialogAction === 'reject' ? '差戻し' :
               dialogAction === 'submit' ? '申請' :
               dialogAction === 'edit' ? '再申請' : '実行'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminExpensesPage; 
