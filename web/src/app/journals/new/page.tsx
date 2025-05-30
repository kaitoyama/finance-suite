"use client";

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, SubmitHandler, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateJournalEntry } from '@/hooks/useJournal';
import { useGetAccounts } from '@/hooks/useAccount';
import { CreateJournalEntryInput, JournalLineInput } from '@/gql/graphql';
import Link from 'next/link';
import { PlusCircle, Trash2, CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Zod schema for a single journal line
const journalLineSchema = z.object({
  accountId: z.string().min(1, { message: '勘定科目を選択してください。' }),
  debit: z.string().optional(),
  credit: z.string().optional(),
}).refine(data => {
  const debit = parseFloat(data.debit || '0');
  const credit = parseFloat(data.credit || '0');
  return debit >= 0 && credit >= 0;
}, {
  message: "金額は0以上である必要があります。",
  path: ["debit"]
}).refine(data => {
  const debit = data.debit ? parseFloat(data.debit) : 0;
  const credit = data.credit ? parseFloat(data.credit) : 0;
  return debit > 0 || credit > 0;
}, {
  message: '借方または貸方のいずれかに0より大きい金額を入力してください。',
  path: ['debit'],
}).refine(data => {
  const debit = data.debit ? parseFloat(data.debit) : 0;
  const credit = data.credit ? parseFloat(data.credit) : 0;
  return !(debit > 0 && credit > 0);
}, {
  message: '借方と貸方の両方に金額を入力することはできません。',
  path: ['debit'],
});

// Zod schema for the journal entry form
const journalEntryFormSchema = z.object({
  datetime: z.date({ required_error: '日付は必須です。' }),
  description: z.string().optional(),
  lines: z.array(journalLineSchema).min(2, '仕訳行は最低2行必要です。'),
});

type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;

export default function NewJournalEntryPage() {
  const router = useRouter();
  const { createJournalEntry, loading: submissionLoading, error: submissionErrorHook } = useCreateJournalEntry();
  const { accounts, loading: accountsLoading, error: accountsError } = useGetAccounts();
  const [balance, setBalance] = useState({ debit: 0, credit: 0 });

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntryFormSchema),
    defaultValues: {
      datetime: new Date(),
      description: '',
      lines: [
        { accountId: '', debit: '', credit: '' },
        { accountId: '', debit: '', credit: '' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const watchedLines = useWatch({
    control: form.control,
    name: 'lines',
    defaultValue: form.getValues('lines'),
  });

  useEffect(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    if (Array.isArray(watchedLines)) {
      watchedLines.forEach(line => {
        const debitAmount = parseFloat(line?.debit || '0');
        const creditAmount = parseFloat(line?.credit || '0');
        totalDebit += isNaN(debitAmount) ? 0 : debitAmount;
        totalCredit += isNaN(creditAmount) ? 0 : creditAmount;
      });
    }
    setBalance({ debit: totalDebit, credit: totalCredit });
  }, [watchedLines]);

  const onSubmit: SubmitHandler<JournalEntryFormValues> = async (values) => {
    if (balance.debit !== balance.credit) {
      alert("借方と貸方の合計が一致しません。");
      return;
    }
    if (balance.debit === 0) {
      alert("合計金額が0です。");
      return;
    }

    const journalLines: JournalLineInput[] = values.lines.map(line => ({
      accountId: parseInt(line.accountId, 10),
      debit: line.debit ? parseFloat(line.debit) : undefined,
      credit: line.credit ? parseFloat(line.credit) : undefined,
    }));

    const input: CreateJournalEntryInput = {
      datetime: values.datetime.toISOString(),
      description: values.description,
      lines: journalLines,
    };

    try {
      await createJournalEntry(input);
      alert("仕訳が正常に作成されました。");
      router.push('/journals');
    } catch (e: unknown) {
      console.error('Failed to create journal entry', e);
      const errorMessage = (e instanceof Error && 'graphQLErrors' in e) 
        ? (e as { graphQLErrors?: Array<{ message: string }> }).graphQLErrors?.map(err => err.message).join(", ") 
        : e instanceof Error ? e.message : "仕訳の作成に失敗しました。";
      alert("エラー: " + errorMessage);
    }
  };

  if (accountsLoading) return <p>勘定科目を読み込み中...</p>;
  if (accountsError) return <p>勘定科目の読み込みに失敗しました: {accountsError.message}</p>;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">仕訳作成</h1>
        <Button variant="outline" asChild>
          <Link href="/journals">仕訳一覧へ戻る</Link> 
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="datetime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>日付</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>日付を選択</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>摘要</FormLabel>
                  <FormControl>
                    <Input placeholder="例: 事務用品購入" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <h2 className="text-xl font-semibold">仕訳行</h2>
          {fields.map((item, index) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-11 gap-2 items-start border p-4 rounded-md">
              <div className="md:col-span-4 col-span-11">
                <FormField
                  control={form.control}
                  name={`lines.${index}.accountId`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>勘定科目</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="勘定科目を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {accounts?.map((account) => (
                            <SelectItem key={account.id} value={String(account.id)}>
                              {account.code} - {account.name} ({account.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-3 col-span-5">
                <FormField
                  control={form.control}
                  name={`lines.${index}.debit`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>借方</FormLabel>
                      <FormControl>
                        <Input type="text" inputMode="decimal" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-3 col-span-5">
                <FormField
                  control={form.control}
                  name={`lines.${index}.credit`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>貸方</FormLabel>
                      <FormControl>
                        <Input type="text" inputMode="decimal" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="md:col-span-1 col-span-1 flex items-end h-full">
                {fields.length > 2 && (
                  <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} className="mt-auto">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => append({ accountId: '', debit: '', credit: '' })}>
            <PlusCircle className="mr-2 h-4 w-4" /> 行を追加
          </Button>

          <div className="mt-6 p-4 border rounded-md">
            <h3 className="text-lg font-semibold">貸借合計</h3>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>借方合計: {balance.debit.toLocaleString()}</div>
              <div>貸方合計: {balance.credit.toLocaleString()}</div>
            </div>
            {balance.debit !== balance.credit && (balance.debit > 0 || balance.credit > 0) && 
              <p className="text-red-500 mt-2">借方と貸方の合計が一致しません。</p>}
          </div>
          
          {submissionErrorHook && (
            <p className="text-sm font-medium text-destructive">
              エラー: {submissionErrorHook.graphQLErrors?.map(e => e.message).join(', ') || submissionErrorHook.message}
            </p>
          )}
          <Button type="submit" disabled={submissionLoading || form.formState.isSubmitting}>
            {submissionLoading || form.formState.isSubmitting ? '作成中...' : '仕訳を作成'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
