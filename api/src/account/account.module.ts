import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma.module'; // Correct path to PrismaModule

@Module({
  imports: [PrismaModule],
  // If you create AccountService/Resolver, add them here and export
  exports: [], // Export AccountService if it's to be used by JournalService directly
})
export class AccountModule {}
