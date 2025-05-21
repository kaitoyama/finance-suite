import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InvoicePdfResolver } from './invoice-pdf.resolver';
// PdfModule and MinioModule are global, so their services (PdfService, MinioService) 
// can be injected directly into InvoicePdfResolver without importing the modules here.
// However, it's good practice to list them if they are direct logical dependencies of this feature module.
// For this setup, as they are global, direct import here is not strictly needed for injection to work.

@Module({
  imports: [
    ConfigModule, // For ConfigService injection in the resolver
    // MinioModule, // Not needed here as it's global
    // PdfModule,   // Not needed here as it's global
  ],
  providers: [InvoicePdfResolver, /* PdfService and MinioService are globally provided */],
})
export class InvoicePdfModule {} 