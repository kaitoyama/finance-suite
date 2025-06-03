'use client';

import React, { useState } from 'react';
import { useGetBudgets, useSetBudget } from '../../../hooks/useBudgets';
import { useGetCategories } from '../../../hooks/useCategory';
import { BudgetBalance } from '../../../gql/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const budgetFormSchema = z.object({
  categoryId: z.string().min(1, 'カテゴリを選択してください'),
  fiscalYear: z.number().min(2000, '年度は2000年以降である必要があります'),
  amountPlanned: z.number().min(0, '予算額は0以上である必要があります'),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

const BudgetsDashboardPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [yearInput, setYearInput] = useState<string>(currentYear.toString());
  const [showBudgetForm, setShowBudgetForm] = useState<boolean>(false);

  const { budgets, loading, error, refetchBudgets } = useGetBudgets(selectedYear);
  const { categories } = useGetCategories();
  const { setBudget } = useSetBudget();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      categoryId: '',
      fiscalYear: selectedYear,
      amountPlanned: 0,
    },
  });

  const handleYearChange = () => {
    const newYear = parseInt(yearInput, 10);
    if (!isNaN(newYear)) {
      setSelectedYear(newYear);
      form.setValue('fiscalYear', newYear);
    }
  };

  const onSubmitBudget = async (values: BudgetFormValues) => {
    try {
      await setBudget({
        categoryId: parseInt(values.categoryId, 10),
        fiscalYear: values.fiscalYear,
        amountPlanned: values.amountPlanned,
      });
      form.reset();
      setShowBudgetForm(false);
      refetchBudgets();
    } catch (error) {
      console.error('Failed to set budget:', error);
    }
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;

  const budgetList = budgets || [];

  return (
    <div>
      <PageHeader
        title="予算管理"
        description="年度別予算の計画と実績を管理"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>予算概要</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Responsive controls for year selection */}
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 mb-4 items-stretch sm:items-center">
            <Input
              type="number"
              placeholder="年度を入力"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="w-full sm:max-w-xs" // Full width on small screens, max-w-xs on sm+
            />
            <Button onClick={handleYearChange} className="w-full sm:w-auto">予算を表示</Button> {/* Full width on small screens */}
            <Button 
              onClick={() => setShowBudgetForm(!showBudgetForm)}
              variant="outline"
              className="w-full sm:w-auto" // Full width on small screens
            >
              {showBudgetForm ? '予算設定を閉じる' : '予算を設定'}
            </Button>
          </div>
          
          {showBudgetForm && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>予算設定</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitBudget)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>カテゴリ</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="カテゴリを選択" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories?.map((category) => (
                                <SelectItem key={category.id} value={category.id.toString()}>
                                  {category.name}
                                  {category.description && ` - ${category.description}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="amountPlanned"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>予算額</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="予算額を入力"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Responsive form buttons */}
                    <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                      <Button type="submit" className="w-full sm:w-auto">予算を設定</Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowBudgetForm(false)}
                        className="w-full sm:w-auto"
                      >
                        キャンセル
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}

          <p className="text-lg font-semibold mb-2">表示中の年度: {selectedYear}</p>
          {budgetList.length === 0 && !loading && (
            <p>選択された年度の予算データがありません。</p>
          )}
          {budgetList.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>カテゴリ名</TableHead>
                  <TableHead className="hidden sm:table-cell">説明</TableHead> {/* Hidden on xs, visible sm+ */}
                  <TableHead className="text-right">予算</TableHead>
                  <TableHead className="text-right">実績</TableHead>
                  <TableHead className="text-right">残予算</TableHead>
                  <TableHead className="text-right">使用率 (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetList.map((budget: BudgetBalance) => {
                  if (!budget) return null;
                  const ratioPercentage = (budget.ratio * 100).toFixed(2);
                  return (
                    <TableRow key={budget.categoryId}>
                      <TableCell>{budget.categoryName}</TableCell>
                      <TableCell className="hidden sm:table-cell">{budget.categoryDescription || '-'}</TableCell> {/* Hidden on xs, visible sm+ */}
                      <TableCell className="text-right">¥{budget.planned.toLocaleString()}</TableCell>
                      <TableCell className="text-right">¥{budget.actual.toLocaleString()}</TableCell>
                      <TableCell
                        className={cn(
                          'text-right',
                          budget.remaining < 0 ? 'text-red-500' : ''
                        )}
                      >
                        ¥{budget.remaining.toLocaleString()}
                      </TableCell>
                      <TableCell
                        className={cn(
                          'text-right',
                          budget.ratio > 0.8 ? 'text-yellow-500' : ''
                        )}
                      >
                        {ratioPercentage}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetsDashboardPage; 