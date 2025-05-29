import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ConfigService } from '@nestjs/config';
import { AccountCategory } from '@prisma/client';
import { ProfitLossStatement, AccountSummary } from './dto/profit-loss.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ProfitLossService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  private getFiscalYearDates(fiscalYear: number): {
    startDate: Date;
    endDate: Date;
  } {
    const fiscalYearStartSetting =
      this.configService.get<string>('FISCAL_YEAR_START') || '04-01';
    const [startMonth, startDay] = fiscalYearStartSetting
      .split('-')
      .map(Number);

    const startDate = new Date(Date.UTC(fiscalYear, startMonth - 1, startDay));
    const endDate = new Date(
      Date.UTC(fiscalYear + 1, startMonth - 1, startDay - 1),
    );

    return { startDate, endDate };
  }

  async generateProfitLossStatement(
    fiscalYear: number,
  ): Promise<ProfitLossStatement> {
    const { startDate, endDate } = this.getFiscalYearDates(fiscalYear);

    // Get all revenue and expense accounts
    const revenueAccounts = await this.prisma.account.findMany({
      where: { category: AccountCategory.REVENUE },
      orderBy: { code: 'asc' },
    });

    const expenseAccounts = await this.prisma.account.findMany({
      where: { category: AccountCategory.EXPENSE },
      orderBy: { code: 'asc' },
    });

    // Get all journal entries within the fiscal year
    const journalEntries = await this.prisma.journalEntry.findMany({
      where: {
        datetime: {
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

    // Calculate account balances
    const accountBalances = new Map<
      number,
      { totalDebit: Decimal; totalCredit: Decimal }
    >();

    for (const entry of journalEntries) {
      for (const line of entry.lines) {
        const current = accountBalances.get(line.accountId) || {
          totalDebit: new Decimal(0),
          totalCredit: new Decimal(0),
        };

        current.totalDebit = current.totalDebit.add(
          new Decimal(line.debit?.toString() || '0'),
        );
        current.totalCredit = current.totalCredit.add(
          new Decimal(line.credit?.toString() || '0'),
        );

        accountBalances.set(line.accountId, current);
      }
    }

    // Calculate revenue balances (Credit - Debit for revenue accounts)
    const revenues: AccountSummary[] = revenueAccounts
      .map((account) => {
        const balance = accountBalances.get(account.id);
        const netBalance = balance
          ? balance.totalCredit.minus(balance.totalDebit).toNumber()
          : 0;

        return {
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          balance: netBalance,
        };
      })
      .filter((revenue) => revenue.balance !== 0);

    // Calculate expense balances (Debit - Credit for expense accounts)
    const expenses: AccountSummary[] = expenseAccounts
      .map((account) => {
        const balance = accountBalances.get(account.id);
        const netBalance = balance
          ? balance.totalDebit.minus(balance.totalCredit).toNumber()
          : 0;

        return {
          accountId: account.id,
          accountCode: account.code,
          accountName: account.name,
          balance: netBalance,
        };
      })
      .filter((expense) => expense.balance !== 0);

    // Calculate totals
    const totalRevenue = revenues.reduce(
      (sum, revenue) => sum + revenue.balance,
      0,
    );
    const totalExpense = expenses.reduce(
      (sum, expense) => sum + expense.balance,
      0,
    );
    const netIncome = totalRevenue - totalExpense;

    return {
      fiscalYear,
      startDate: startDate.toLocaleDateString('ja-JP'),
      endDate: endDate.toLocaleDateString('ja-JP'),
      revenues,
      expenses,
      totalRevenue,
      totalExpense,
      netIncome,
    };
  }
}
