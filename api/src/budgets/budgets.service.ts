import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { BudgetBalance } from './dto/budget-balance.dto';
import { AccountCategory, Budget, Prisma } from '@prisma/client';
import { BudgetInput } from './dto/budget.input';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BudgetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async setBudget(input: BudgetInput): Promise<Budget> {
    const { categoryId, fiscalYear, amountPlanned } = input;
    const amountPlannedDecimal = new Decimal(amountPlanned.toString());

    return this.prisma.budget.upsert({
      where: {
        categoryId_fiscalYear: {
          categoryId,
          fiscalYear,
        },
      },
      update: {
        amountPlanned: amountPlannedDecimal,
      },
      create: {
        categoryId,
        fiscalYear,
        amountPlanned: amountPlannedDecimal,
      },
    });
  }

  async listBudgetsByYear(fiscalYear: number): Promise<Budget[]> {
    return this.prisma.budget.findMany({
      where: {
        fiscalYear,
      },
      include: { category: true },
    });
  }

  async getBudgetBalances(year: number): Promise<BudgetBalance[]> {
    const fiscalYearStartSetting =
      this.configService.get<string>('FISCAL_YEAR_START') || '04-01';
    const [startMonth, startDay] = fiscalYearStartSetting
      .split('-')
      .map(Number);
    const startDate = new Date(Date.UTC(year, startMonth - 1, startDay));
    const endDate = new Date(Date.UTC(year + 1, startMonth - 1, startDay - 1));

    const budgetsForYear = await this.prisma.budget.findMany({
      where: {
        fiscalYear: year,
        amountPlanned: { gt: 0 },
      },
      include: {
        category: true,
      },
    });

    if (budgetsForYear.length === 0) {
      return [];
    }

    // Get all paid expenses within the fiscal year grouped by category
    const expensesByCategory = await this.prisma.expenseRequest.findMany({
      where: {
        state: 'PAID',
        approvedAt: {
          gte: startDate,
          lte: endDate,
        },
        categoryId: { not: null },
      },
      include: {
        category: true,
      },
    });

    const categoryAggregates = new Map<number, Decimal>();

    for (const expense of expensesByCategory) {
      if (expense.categoryId) {
        const current = categoryAggregates.get(expense.categoryId) || new Decimal(0);
        categoryAggregates.set(
          expense.categoryId,
          current.add(new Decimal(expense.amount.toString()))
        );
      }
    }

    const budgetBalances: BudgetBalance[] = budgetsForYear.map((budget) => {
      const category = budget.category;
      const planned = budget.amountPlanned.toNumber();

      const actual = categoryAggregates.get(budget.categoryId)?.toNumber() || 0;
      const remaining = planned - actual;
      // Ensure planned is not zero before division and handle toFixed for precision
      const ratio =
        planned === 0 ? 0 : parseFloat((actual / planned).toFixed(4));

      return {
        categoryId: category.id,
        categoryName: category.name,
        categoryDescription: category.description || undefined,
        planned,
        actual,
        remaining,
        // Ensure ratio is within 0-1 bounds, even with potential floating point inaccuracies
        ratio: Math.max(0, Math.min(1, ratio)),
      };
    });

    return budgetBalances;
  }
}
