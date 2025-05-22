'use client';

import React, { useState } from 'react';
import { useGetBudgets } from '../../../hooks/useBudgets';
import { BudgetBalance } from '../../../gql/graphql';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BudgetsDashboardPage = () => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [yearInput, setYearInput] = useState<string>(currentYear.toString());

  const { budgets, loading, error, refetchBudgets } = useGetBudgets(selectedYear);

  const handleYearChange = () => {
    const newYear = parseInt(yearInput, 10);
    if (!isNaN(newYear)) {
      setSelectedYear(newYear);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  const budgetList = budgets || [];

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4 items-center">
            <Input
              type="number"
              placeholder="Enter Year"
              value={yearInput}
              onChange={(e) => setYearInput(e.target.value)}
              className="max-w-xs"
            />
            <Button onClick={handleYearChange}>View Budget for Year</Button>
          </div>
          <p className="text-lg font-semibold mb-2">Displaying budget for: {selectedYear}</p>
          {budgetList.length === 0 && !loading && (
            <p>No budget data available for the selected year or no budgets with planned amounts.</p>
          )}
          {budgetList.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Account Code</TableHead>
                  <TableHead className="text-right">Planned</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="text-right">Ratio (%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgetList.map((budget: BudgetBalance) => {
                  if (!budget) return null;
                  const ratioPercentage = (budget.ratio * 100).toFixed(2);
                  return (
                    <TableRow key={budget.accountId}>
                      <TableCell>{budget.accountName}</TableCell>
                      <TableCell>{budget.accountCode}</TableCell>
                      <TableCell className="text-right">{budget.planned.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{budget.actual.toLocaleString()}</TableCell>
                      <TableCell
                        className={cn(
                          'text-right',
                          budget.remaining < 0 ? 'text-red-500' : ''
                        )}
                      >
                        {budget.remaining.toLocaleString()}
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