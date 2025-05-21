import { Module } from '@nestjs/common';
import { JournalService } from './journal.service';
// import { JournalController } from './journal.controller'; // Removed
import { JournalResolver } from './journal.resolver';
import { PrismaModule } from '../prisma.module'; // Correct path
import { UsersModule } from '../users/users.module'; // Corrected import: UsersModule from users.module

@Module({
  // controllers: [JournalController], // Removed
  imports: [PrismaModule, UsersModule], // Corrected module name: UsersModule
  providers: [JournalService, JournalResolver],
})
export class JournalModule {}
