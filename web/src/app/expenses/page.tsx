'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpenseRequestsListQuery } from '@/hooks/useExpenseRequestsListQuery'; 
import { useApproveExpenseRequestMutation } from '@/hooks/useApproveExpenseRequestMutation';
import { useRejectExpenseRequestMutation } from '@/hooks/useRejectExpenseRequestMutation';
import withAdmin from '@/components/auth/withAdmin';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table'; 
import { ColumnDef } from "@tanstack/react-table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import toast, { Toaster } from 'react-hot-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ExpenseRequest as GeneratedExpenseRequestType, User } from '@/gql/graphql'; // Import generated types

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
  attachmentId?: string | null; // ID of the attachment, can be string or number based on schema
  // attachmentCount?: number; // If you have a specific field for this
}

const AdminExpensesPage = () => {
  const router = useRouter();
  const { data, fetching, error, refetch } = useExpenseRequestsListQuery();
  const { approveExpenseRequest } = useApproveExpenseRequestMutation();
  const { rejectExpenseRequest } = useRejectExpenseRequestMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<number | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(`Error fetching expenses: ${error.message}`);
    }
  }, [error]);

  const handleActionClick = (id: number, action: 'approve' | 'reject') => {
    setSelectedExpenseId(id);
    setDialogAction(action);
    setIsDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedExpenseId || !dialogAction) return;

    const actionPromise = dialogAction === 'approve' 
      ? approveExpenseRequest({ id: selectedExpenseId })
      : rejectExpenseRequest({ id: selectedExpenseId });

    toast.promise(
      actionPromise.then(res => {
        const mutationResult = dialogAction === 'approve' ? res.data?.approveExpenseRequest : res.data?.rejectExpenseRequest;
        if (res.error || !mutationResult) {
          throw new Error(res.error?.message || `Failed to ${dialogAction}`);
        }
        refetch({ requestPolicy: 'network-only' }); 
        setIsDialogOpen(false);
        setSelectedExpenseId(null);
        setDialogAction(null);
        return `${dialogAction === 'approve' ? 'Approved' : 'Rejected'} successfully.`;
      }),
      {
        loading: `Processing ${dialogAction}...`,
        success: (message: string) => message,
        error: (err: Error) => `Failed to ${dialogAction}: ${err.message}`,
      }
    );
  };

  // Using `any` for row in cell definitions to bypass complex type inference issues with DataTable for now.
  const columns: ColumnDef<ExpenseRequestForTable>[] = useMemo(() => [
    { accessorKey: 'id', header: 'ID' },
    {
      accessorKey: 'requester.username',
      header: '申請者',
      cell: ({ row }: any) => row.original.requester?.username || 'N/A',
    },
    {
        accessorKey: 'amount',
        header: '金額',
        cell: ({ row }: any) => `¥${row.original.amount.toLocaleString()}`,
    },
    {
        accessorKey: 'attachmentId',
        header: '添付ファイル数',
        cell: ({ row }: any) => (row.original.attachmentId ? '1' : '0'),
    },
    {
        accessorKey: 'createdAt',
        header: '申請日',
        cell: ({ row }: any) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
        accessorKey: 'state',
        header: '状態',
        cell: ({ row }: any) => <Badge variant={row.original.state === 'PENDING' ? 'default' : 'secondary'}>{row.original.state}</Badge>
    },
    {
        id: 'actions',
        header: 'アクション',
        cell: ({ row }: any) => (
            <div className="space-x-2">
                <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleActionClick(row.original.id, 'approve');}}>承認</Button>
                <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation();handleActionClick(row.original.id, 'reject');}}>差戻し</Button>
            </div>
        ),
    },
  ], [refetch, approveExpenseRequest, rejectExpenseRequest]);

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
  const pendingTableData: ExpenseRequestForTable[] = (data?.expenseRequests || [])
    .filter((req: any): req is GeneratedExpenseRequestType & { state: 'PENDING', id: number, amount: number, createdAt: string, requester: RequesterInfo | null } => {
        if (!req) return false;
        const isPending = req.state === 'PENDING';
        const hasValidId = typeof req.id === 'number';
        const hasValidAmount = typeof req.amount === 'number';
        const hasValidCreatedAt = typeof req.createdAt === 'string';
        const hasValidRequester = req.requester === null || 
            (typeof req.requester === 'object' && 
             req.requester !== null && 
             typeof req.requester.username === 'string' && 
            (typeof (req.requester as any).id === 'string' || typeof (req.requester as any).id === 'number') 
            );
        return isPending && hasValidId && hasValidAmount && hasValidCreatedAt && hasValidRequester;
    })
    .map((req: any) => ({
      __typename: req.__typename,
      id: req.id,
      requester: req.requester ? { __typename: req.requester.__typename, id: String(req.requester.id), username: req.requester.username } : null,
      amount: req.amount,
      createdAt: req.createdAt,
      state: req.state as string,
      attachmentId: req.attachmentId // Assuming attachmentId is what you had for attachment count logic
    }));

  // Data for ALL expenses table (new logic)
  const allTableData: ExpenseRequestForTable[] = (data?.expenseRequests || [])
    .filter((req: any): req is GeneratedExpenseRequestType & { id: number, amount: number, createdAt: string, state: string, requester: RequesterInfo | null } => {
        if (!req) return false;
        // Basic type guards, adjust as necessary for your full data structure
        const hasValidId = typeof req.id === 'number';
        const hasValidAmount = typeof req.amount === 'number';
        const hasValidCreatedAt = typeof req.createdAt === 'string';
        const hasValidState = typeof req.state === 'string';
        const hasValidRequester = req.requester === null || 
            (typeof req.requester === 'object' && 
             req.requester !== null && 
             typeof req.requester.username === 'string' && 
             (typeof (req.requester as any).id === 'string' || typeof (req.requester as any).id === 'number')
            );
        return hasValidId && hasValidAmount && hasValidCreatedAt && hasValidState && hasValidRequester;
    })
    .map((req: any) => ({
      __typename: req.__typename,
      id: req.id,
      requester: req.requester ? { __typename: req.requester.__typename, id: String(req.requester.id), username: req.requester.username } : null,
      amount: req.amount,
      createdAt: req.createdAt,
      state: req.state as string,
      attachmentId: req.attachmentId // Assuming attachmentId is what you had for attachment count logic
    }));

  return (
    <div className="container mx-auto py-10 space-y-8"> {/* Added space-y-8 for spacing between tables */}
      <Toaster position="top-center" />
      
      {/* Pending Expenses Table (existing) */}
      <div>
        <h1 className="text-2xl font-bold mb-4">未承認経費一覧</h1>
        <DataTable<ExpenseRequestForTable, any>
          columns={columns} // Reusing columns for now
          data={pendingTableData}
          onRowClick={(row: any) => { 
            if (row.original.id) { 
               router.push(`/expenses/${row.original.id}`);
            }
          }}
        />
      </div>

      {/* All Expenses Table (new) */}
      <div>
        <h1 className="text-2xl font-bold mb-4 mt-8">全経費一覧</h1> {/* Added mt-8 for spacing */}
        <DataTable<ExpenseRequestForTable, any>
          columns={columns} // Reusing columns for now, can be customized
          data={allTableData}
          onRowClick={(row: any) => { 
            if (row.original.id) { 
               router.push(`/expenses/${row.original.id}`);
            }
          }}
        />
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認</AlertDialogTitle>
            <AlertDialogDescription>
              {`ID: ${selectedExpenseId} の経費申請を${dialogAction === 'approve' ? '承認' : '差戻し'}しますか？`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              {dialogAction === 'approve' ? '承認' : '差戻し'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default withAdmin(AdminExpensesPage); 