"use client";

import React, { useMemo } from 'react';
import { useImmer } from 'use-immer';
import { useRouter } from 'next/navigation'; // Added useRouter
import toast from 'react-hot-toast'; // Added toast

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { XIcon, CheckIcon, AlertTriangleIcon } from 'lucide-react';

// Attempt to import the required mutation and types
import {
  useCreateJournalEntryMutation,
  type CreateJournalEntryMutationVariables,
  type JournalLineInput,
  // Assuming the mutation response will have a structure like:
  // type CreateJournalEntryMutation = { createJournalEntry: { id: string } }
} from '@/gql/graphql';

// Define interfaces for the local state structure
interface UILine {
  accountId: string;
  notes: string;
  debit: string;
  credit: string;
}

interface UIJournalEntry {
  date: string;
  description: string;
  lines: UILine[];
}

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const NewJournalPage = () => {
  const [journalEntry, updateJournalEntry] = useImmer<UIJournalEntry>({
    date: getTodayDate(),
    description: '',
    lines: [{ accountId: '', notes: '', debit: '', credit: '' }],
  });

  const router = useRouter(); // Instantiate useRouter

  // Instantiate the mutation hook
  const [mutationResult, executeMutation] = useCreateJournalEntryMutation();

  const handleHeaderChange = (field: keyof Pick<UIJournalEntry, 'date' | 'description'>, value: string) => {
    updateJournalEntry((draft) => {
      draft[field] = value;
    });
  };

  const handleLineChange = (index: number, field: keyof UILine, value: string) => {
    updateJournalEntry((draft) => {
      if (field === 'debit' || field === 'credit') {
        if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
          draft.lines[index][field] = value;
        }
      } else {
        draft.lines[index][field] = value;
      }
    });
  };

  const addRow = () => {
    updateJournalEntry((draft) => {
      draft.lines.push({ accountId: '', notes: '', debit: '', credit: '' });
    });
  };

  const removeRow = (index: number) => {
    updateJournalEntry((draft) => {
      if (draft.lines.length > 1) {
        draft.lines.splice(index, 1);
      }
    });
  };

  const { debitTotal, creditTotal } = useMemo(() => {
    let debit = 0;
    let credit = 0;
    journalEntry.lines.forEach(line => {
      const debitValue = parseFloat(line.debit);
      const creditValue = parseFloat(line.credit);
      if (!isNaN(debitValue)) debit += debitValue;
      if (!isNaN(creditValue)) credit += creditValue;
    });
    return { debitTotal: debit, creditTotal: credit };
  }, [journalEntry.lines]);

  const totalsMatch = debitTotal === creditTotal && debitTotal > 0;
  const currencyFormatter = new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!totalsMatch) {
      toast.error("借方と貸方の合計が一致していません。");
      return;
    }
     // Basic check for accountId in all lines
    if (journalEntry.lines.some(line => !line.accountId)) {
      toast.error("すべての行で勘定科目を選択してください。");
      return;
    }

    const linesInput: JournalLineInput[] = journalEntry.lines.map(line => ({
      accountId: line.accountId,
      debit: String(parseFloat(line.debit) || 0),
      credit: String(parseFloat(line.credit) || 0),
      notes: line.notes,
    }));

    const variables: CreateJournalEntryMutationVariables = {
      input: {
        date: journalEntry.date,
        description: journalEntry.description,
        lines: linesInput,
      }
    };

    try {
      const result = await executeMutation(variables);
      // Assuming `result.data.createJournalEntry.id` is the path to the ID
      // This structure depends on the actual GraphQL schema and generated types.
      // If `useCreateJournalEntryMutation` is the fallback, result.data will be null.
      if (result.data && result.data.createJournalEntry && result.data.createJournalEntry.id) {
        toast.success("仕訳を登録しました。");
        router.push(`/journals/${result.data.createJournalEntry.id}`);
      } else if (result.error) {
        console.error('Mutation error:', result.error);
        toast.error(`登録に失敗しました: ${result.error.message}`);
      } else if (!result.data || !result.data.createJournalEntry || !result.data.createJournalEntry.id) {
        // This case handles if the mutation hook is the fallback or if the response structure is unexpected
        console.error('Mutation failed or returned unexpected data structure:', result);
        // Avoid showing generic error if it's the placeholder mutation.
        if (typeof useCreateJournalEntryMutation !== 'undefined') {
            toast.error("登録に失敗しました。予期せぬエラーが発生しました。");
        }
      }
    } catch (error) {
      console.error('An unexpected error occurred during mutation:', error);
      toast.error("登録中に予期せぬエラーが発生しました。");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">仕訳入力</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4 space-y-2">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              日付
            </label>
            <Input
              type="date"
              id="date"
              value={journalEntry.date}
              onChange={(e) => handleHeaderChange('date', e.target.value)}
              className="w-full md:w-1/3"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <Input
              id="description"
              placeholder="例: オフィス用品の購入"
              value={journalEntry.description}
              onChange={(e) => handleHeaderChange('description', e.target.value)}
              className="w-full"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">勘定科目</TableHead>
                <TableHead className="w-1/3">備考</TableHead>
                <TableHead className="text-right">借方 ¥</TableHead>
                <TableHead className="text-right">貸方 ¥</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {journalEntry.lines.map((line, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Select
                      value={line.accountId}
                      onValueChange={(value) => handleLineChange(index, 'accountId', value)}
                      // required attribute is not standard for Select, validation handled in handleSubmit
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="勘定科目を選択" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">現金</SelectItem>
                        <SelectItem value="accounts_receivable">売掛金</SelectItem>
                        <SelectItem value="accounts_payable">買掛金</SelectItem>
                        <SelectItem value="office_supplies">事務用品費</SelectItem>
                        <SelectItem value="rent_expense">地代家賃</SelectItem>
                        <SelectItem value="sales">売上</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="備考"
                      value={line.notes}
                      onChange={(e) => handleLineChange(index, 'notes', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      className="text-right"
                      value={line.debit}
                      onChange={(e) => handleLineChange(index, 'debit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="text"
                      inputMode="decimal"
                      placeholder="0"
                      className="text-right"
                      value={line.credit}
                      onChange={(e) => handleLineChange(index, 'credit', e.target.value)}
                    />
                  </TableCell>
                  <TableCell>
                    {journalEntry.lines.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(index)}>
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center mb-4">
          <Button type="button" variant="outline" onClick={addRow}>
            行を追加
          </Button>
          <div className="flex items-center space-x-2 text-lg">
            <span>合計:</span>
            <span className={`font-semibold ${!totalsMatch && (debitTotal !== 0 || creditTotal !== 0) ? 'text-red-500' : ''}`}>
              ¥{currencyFormatter.format(debitTotal)}
            </span>
            <span>{totalsMatch ? '==' : '!='}</span>
            <span className={`font-semibold ${!totalsMatch && (debitTotal !== 0 || creditTotal !== 0) ? 'text-red-500' : ''}`}>
              ¥{currencyFormatter.format(creditTotal)}
            </span>
            {totalsMatch ? (
              <CheckIcon className="h-6 w-6 text-green-500" />
            ) : (
              (debitTotal !== 0 || creditTotal !== 0) && <AlertTriangleIcon className="h-6 w-6 text-red-500" />
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>キャンセル</Button> {/* Added Cancel functionality */}
          <Button type="submit" disabled={mutationResult.fetching || !totalsMatch}>
            {mutationResult.fetching ? '登録中...' : '登録'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default NewJournalPage;
