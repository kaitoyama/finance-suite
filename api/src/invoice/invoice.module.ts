import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceResolver } from './invoice.resolver';
import { UsersModule } from '../users/users.module'; // For UserService injection
import { JournalModule } from '../journal/journal.module';
// PrismaModule, PdfModule, MinioModule are global, no need to import here

@Module({
  imports: [
    UsersModule, // Provides UserService
    JournalModule,
  ],
  providers: [InvoiceResolver, InvoiceService],
})
export class InvoiceModule {}
