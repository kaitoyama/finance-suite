'use client';

import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import { useCreateAccount } from '@/hooks/useAccount';
import { AccountCategory, CreateAccountInput } from '@/gql/graphql';
import Link from 'next/link';

// Define AccountCategory values as a const array for Zod and options
// This ensures the values are treated as string literals
const accountCategoryValues = [
  'ASSET', 
  'LIABILITY', 
  'EQUITY', 
  'REVENUE', 
  'EXPENSE'
] as const; // Use 'as const' for stricter typing, making it a tuple of string literals

// Zod schema for form validation
const accountFormSchema = z.object({
  code: z.string().min(1, { message: '科目コードは必須です。' }),
  name: z.string().min(1, { message: '科目名は必須です。' }),
  category: z.enum(accountCategoryValues, {
    errorMap: () => ({ message: 'カテゴリを選択してください。' }),
  }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

const displayAccountCategoryLabel = (category: AccountCategory) => {
  switch (category) {
    case 'ASSET': return '資産';
    case 'LIABILITY': return '負債';
    case 'EQUITY': return '純資産';
    case 'REVENUE': return '収益';
    case 'EXPENSE': return '費用';
    default:
      return category;
  }
};

const accountCategorySelectOptions = accountCategoryValues.map((category) => ({
  value: category,
  label: displayAccountCategoryLabel(category),
}));

export default function NewAccountPage() {
  const router = useRouter();
  const { createAccount, error: submissionError } = useCreateAccount();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      code: '',
      name: '',
      // category will be handled by Select placeholder
    },
  });

  const onSubmit: SubmitHandler<AccountFormValues> = async (values) => {
    try {
      const input: CreateAccountInput = {
        code: values.code,
        name: values.name,
        category: values.category, // values.category is already of type AccountCategory due to z.enum
      };
      await createAccount(input);
      // TODO: Implement toast notifications via shadcn/ui use-toast
      alert('勘定科目が作成されました。'); // Placeholder for toast
      router.push('/accounts');
    } catch (e) {
      console.error('Failed to create account', e);
      // TODO: Implement toast notifications for errors
      alert('勘定科目の作成に失敗しました。'); // Placeholder for toast
      // setError from react-hook-form can be used for field-specific errors from backend if available
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">勘定科目作成</h1>
        <Button variant="outline" asChild>
          <Link href="/accounts">一覧へ戻る</Link>
        </Button>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>科目コード</FormLabel>
                <FormControl>
                  <Input placeholder="例: 101" {...field} />
                </FormControl>
                <FormDescription>
                  会計システムで使用する科目コードを入力してください。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>科目名</FormLabel>
                <FormControl>
                  <Input placeholder="例: 現金及び預金" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>カテゴリ</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="カテゴリを選択してください" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accountCategorySelectOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          {submissionError && (
            <p className="text-sm font-medium text-destructive">
              エラー: {submissionError.message}
            </p>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? '作成中...' : '作成する'}
          </Button>
        </form>
      </Form>
    </div>
  );
} 