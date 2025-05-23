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
    const { accountId, fiscalYear, amountPlanned } = input;
    const amountPlannedDecimal = new Decimal(amountPlanned.toString());

    return this.prisma.budget.upsert({
      where: {
        accountId_fiscalYear: {
          accountId,
          fiscalYear,
        },
      },
      update: {
        amountPlanned: amountPlannedDecimal,
      },
      create: {
        accountId,
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
      include: { account: true },
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
        account: true,
      },
    });

    if (budgetsForYear.length === 0) {
      return [];
    }

    const journalEntriesInDateRange = await this.prisma.journalEntry.findMany({
      where: {
        datetime: {
          // Assuming JournalEntry has 'datetime'
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        lines: {
          select: {
            accountId: true,
            debit: true,
            credit: true,
          },
        },
      },
    });

    const accountAggregates = new Map<
      number,
      { totalDebit: Decimal; totalCredit: Decimal }
    >();

    for (const entry of journalEntriesInDateRange) {
      if (entry.lines) {
        for (const line of entry.lines) {
          const currentAgg = accountAggregates.get(line.accountId) || {
            totalDebit: new Decimal(0),
            totalCredit: new Decimal(0),
          };
          // Ensure debit/credit are Decimals or add as numbers if they are already numbers
          currentAgg.totalDebit = currentAgg.totalDebit.add(
            new Decimal(line.debit?.toString() || '0'),
          );
          currentAgg.totalCredit = currentAgg.totalCredit.add(
            new Decimal(line.credit?.toString() || '0'),
          );
          accountAggregates.set(line.accountId, currentAgg);
        }
      }
    }

    const budgetBalances: BudgetBalance[] = budgetsForYear.map((budget) => {
      const account = budget.account;
      const planned = budget.amountPlanned.toNumber();

      const aggregate = accountAggregates.get(budget.accountId);
      const sumDebit = aggregate?.totalDebit?.toNumber() || 0;
      const sumCredit = aggregate?.totalCredit?.toNumber() || 0;

      let actualValue = sumDebit - sumCredit;

      if (
        account.category === AccountCategory.REVENUE ||
        account.category === AccountCategory.LIABILITY ||
        account.category === AccountCategory.EQUITY
      ) {
        actualValue = sumCredit - sumDebit;
      }

      const actual = actualValue;
      const remaining = planned - actual;
      // Ensure planned is not zero before division and handle toFixed for precision
      const ratio =
        planned === 0 ? 0 : parseFloat((actual / planned).toFixed(4));

      return {
        accountId: account.id,
        accountCode: account.code,
        accountName: account.name,
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
