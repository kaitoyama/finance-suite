import { Module } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { BudgetsResolver } from './budgets.resolver';
import { ConfigModule } from '@nestjs/config'; // Ensure ConfigModule is imported
// PrismaModule is assumed to be global or handled by app.module

@Module({
  imports: [ConfigModule], // Add ConfigModule if BudgetsService uses ConfigService
  providers: [BudgetsResolver, BudgetsService],
  exports: [BudgetsService], // Export service if other modules might need it
})
export class BudgetsModule {}
