'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetAccounts } from '@/hooks/useAccount';
import { PlusCircle } from 'lucide-react';
import { AccountCategory } from '@/gql/graphql'; // This imports the type

// Helper function to display AccountCategory
const displayAccountCategory = (category: AccountCategory) => {
  // Compare with string literals as AccountCategory is a type
  switch (category) {
    case 'ASSET': return '資産';
    case 'LIABILITY': return '負債';
    case 'EQUITY': return '純資産';
    case 'REVENUE': return '収益';
    case 'EXPENSE': return '費用';
    default:
      // Handle cases where category might be a different string or for future-proofing
      const exhaustiveCheck: never = category;
      return exhaustiveCheck;
  }
};

export default function AccountsPage() {
  const { accounts, loading, error } = useGetAccounts();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading accounts: {error.message}</p>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">勘定科目一覧</h1>
        <Button asChild>
          <Link href="/accounts/new">
            <PlusCircle className="mr-2 h-4 w-4" /> 新規作成
          </Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>科目コード</TableHead>
            <TableHead>科目名</TableHead>
            <TableHead>カテゴリ</TableHead>
            {/* <TableHead>操作</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts?.map((account) => (
            <TableRow key={account.id}>
              <TableCell>{account.code}</TableCell>
              <TableCell>{account.name}</TableCell>
              <TableCell>{displayAccountCategory(account.category)}</TableCell>
              {/* <TableCell>
                <Button variant="outline" size="sm" className="mr-2">
                  編集
                </Button>
                <Button variant="destructive" size="sm">
                  削除
                </Button>
              </TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {accounts && accounts.length === 0 && (
        <p className="text-center mt-4">勘定科目が登録されていません。</p>
      )}
    </div>
  );
} 