import { Module } from '@nestjs/common';
import { BudgetsService } from './budget.service';
import { BudgetsResolver } from './budget.resolver';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [BudgetsResolver, BudgetsService],
})
export class BudgetModule {} 