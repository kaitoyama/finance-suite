'use client';

import React, { useState } from 'react';
import { useProfitLossStatement } from '../../../hooks/useProfitLoss';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

const ReportsPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [yearInput, setYearInput] = useState<string>(currentYear.toString());

  const { profitLossStatement, loading, error, refetch } = useProfitLossStatement(selectedYear);

  const handleYearChange = () => {
    const newYear = parseInt(yearInput, 10);
    if (!isNaN(newYear)) {
      setSelectedYear(newYear);
    }
  };

  const handleExportCSV = () => {
    if (!profitLossStatement) return;

    const csvData = [];
    
    // Header
    csvData.push(['損益計算書', '', '', '']);
    csvData.push(['期間', `${profitLossStatement.startDate} ～ ${profitLossStatement.endDate}`, '', '']);
    csvData.push(['', '', '', '']);
    
    // Revenue section
    csvData.push(['売上高', '', '', '']);
    csvData.push(['科目コード', '科目名', '金額', '']);
    profitLossStatement.revenues.forEach(revenue => {
      csvData.push([revenue.accountCode, revenue.accountName, revenue.balance.toLocaleString(), '']);
    });
    csvData.push(['', '', '', '']);
    csvData.push(['売上高合計', '', profitLossStatement.totalRevenue.toLocaleString(), '']);
    csvData.push(['', '', '', '']);
    
    // Expense section
    csvData.push(['費用', '', '', '']);
    csvData.push(['科目コード', '科目名', '金額', '']);
    profitLossStatement.expenses.forEach(expense => {
      csvData.push([expense.accountCode, expense.accountName, expense.balance.toLocaleString(), '']);
    });
    csvData.push(['', '', '', '']);
    csvData.push(['費用合計', '', profitLossStatement.totalExpense.toLocaleString(), '']);
    csvData.push(['', '', '', '']);
    csvData.push(['当期純利益', '', profitLossStatement.netIncome.toLocaleString(), '']);

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `損益計算書_${profitLossStatement.fiscalYear}年度.csv`;
    link.click();
  };

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラーが発生しました: {error.message}</p>;

  return (
    <div>
      <PageHeader
        title="損益計算書"
        description="年度別の損益計算書を表示・出力"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>損益計算書</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4 items-center">
            <Input
              type="number"
              placeholder="年度を入力"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleYearChange}>表示</Button>
            {profitLossStatement && (
              <Button onClick={handleExportCSV} variant="outline">
                CSVエクスポート
              </Button>
            )}
          </div>
          
          {profitLossStatement && (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">
                  {profitLossStatement.fiscalYear}年度 損益計算書
                </h3>
                <p className="text-sm text-gray-600">
                  期間: {profitLossStatement.startDate} ～ {profitLossStatement.endDate}
                </p>
              </div>

              {/* Revenue Section */}
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">売上高</h4>
                {profitLossStatement.revenues.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>科目コード</TableHead>
                        <TableHead>科目名</TableHead>
                        <TableHead className="text-right">金額</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profitLossStatement.revenues.map((revenue) => (
                        <TableRow key={revenue.accountId}>
                          <TableCell>{revenue.accountCode}</TableCell>
                          <TableCell>{revenue.accountName}</TableCell>
                          <TableCell className="text-right">
                            ¥{revenue.balance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-gray-50">
                        <TableCell colSpan={2}>売上高合計</TableCell>
                        <TableCell className="text-right">
                          ¥{profitLossStatement.totalRevenue.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-600">売上データがありません</p>
                )}
              </div>

              {/* Expense Section */}
              <div className="mb-6">
                <h4 className="text-md font-semibold mb-2">費用</h4>
                {profitLossStatement.expenses.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>科目コード</TableHead>
                        <TableHead>科目名</TableHead>
                        <TableHead className="text-right">金額</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profitLossStatement.expenses.map((expense) => (
                        <TableRow key={expense.accountId}>
                          <TableCell>{expense.accountCode}</TableCell>
                          <TableCell>{expense.accountName}</TableCell>
                          <TableCell className="text-right">
                            ¥{expense.balance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-semibold bg-gray-50">
                        <TableCell colSpan={2}>費用合計</TableCell>
                        <TableCell className="text-right">
                          ¥{profitLossStatement.totalExpense.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-600">費用データがありません</p>
                )}
              </div>

              {/* Net Income */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>当期純利益</span>
                  <span className={cn(
                    profitLossStatement.netIncome < 0 ? 'text-red-500' : 'text-green-600'
                  )}>
                    ¥{profitLossStatement.netIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </>
          )}

          {!profitLossStatement && !loading && (
            <p>選択された年度のデータがありません。</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;