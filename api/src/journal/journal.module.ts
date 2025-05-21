import { Module } from '@nestjs/common';
import { JournalService } from './journal.service';
// import { JournalController } from './journal.controller'; // Removed
import { JournalResolver } from './journal.resolver';
import { PrismaModule } from '../../prisma.module'; // Correct path

@Module({
  // controllers: [JournalController], // Removed
  imports: [PrismaModule], // Add PrismaModule
  providers: [JournalService, JournalResolver],
})
export class JournalModule {}
