import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Budget, Prisma } from '@prisma/client';
import { BudgetInput } from './dto/budget.input';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async setBudget(input: BudgetInput): Promise<Budget> {
    const { accountId, fiscalYear, amountPlanned } = input;
    // Convert amountPlanned to Decimal
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

  async budgets(fiscalYear: number): Promise<Budget[]> {
    return this.prisma.budget.findMany({
      where: {
        fiscalYear,
      },
    });
  }
} 