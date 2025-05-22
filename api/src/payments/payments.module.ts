import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { PrismaModule } from '../prisma.module';
import { ExpenseModule } from '../expense/expense.module';

@Module({
  imports: [PrismaModule, ExpenseModule],
  providers: [PaymentsResolver, PaymentsService],
})
export class PaymentsModule {} 