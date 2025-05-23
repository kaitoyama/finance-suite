import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsResolver } from './payments.resolver';
import { PrismaModule } from '../prisma.module';
import { ExpenseModule } from '../expense/expense.module';
import { JournalModule } from '../journal/journal.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [PrismaModule, ExpenseModule, JournalModule, UsersModule],
  providers: [PaymentsResolver, PaymentsService],
})
export class PaymentsModule {}
