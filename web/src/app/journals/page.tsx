"use client";

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
import { useGetJournalEntries } from '@/hooks/useJournal';
import { JournalEntry } from '@/gql/graphql'; // Ensure this is the correct type
import { format } from 'date-fns';

// Helper to display amounts, ensures two decimal places
const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined) return '-';
  return amount.toFixed(2);
};

export default function JournalEntriesPage() {
  const { journalEntries, loading, error } = useGetJournalEntries();

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;
  if (!journalEntries || journalEntries.length === 0) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="mb-4">仕訳データがありません。</p>
        <Button asChild>
          <Link href="/journals/new">新しい仕訳を作成</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">仕訳帳</h1>
        <Button asChild>
          <Link href="/journals/new">新しい仕訳を作成</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日付</TableHead>
            <TableHead>摘要</TableHead>
            <TableHead className="text-right">借方合計</TableHead>
            <TableHead className="text-right">貸方合計</TableHead>
            <TableHead>明細</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {journalEntries.map((entry: JournalEntry) => {
            const totalDebit = entry.lines?.reduce((sum, line) => sum + (line?.debit || 0), 0) || 0;
            const totalCredit = entry.lines?.reduce((sum, line) => sum + (line?.credit || 0), 0) || 0;
            return (
              <TableRow key={entry.id}>
                <TableCell>{format(new Date(entry.datetime), 'yyyy/MM/dd')}</TableCell>
                <TableCell>{entry.description || '-'}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {entry.lines?.map(line => (
                      line && (
                      <div key={line.id} className="text-xs p-1 border rounded">
                        <span className="font-medium">{line.account?.name} ({line.account?.code})</span>:
                        {line.debit && <span className="text-green-600 ml-1">借 {formatCurrency(line.debit)}</span>}
                        {line.credit && <span className="text-red-600 ml-1">貸 {formatCurrency(line.credit)}</span>}
                      </div>
                      )
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
} 