import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PdfService } from '../common/services/pdf.service';
import { MinioService } from '../storage/minio.service';
import { GenerateInvoicePdfInput, GenerateInvoicePdfPayload } from './dto/generate-invoice-pdf.dto';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Resolver()
export class InvoicePdfResolver {
  private readonly logger = new Logger(InvoicePdfResolver.name);
  // Assuming cwd is finance-suite (monorepo root)
  private readonly templatePath = path.join(process.cwd(), 'api', 'templates', 'invoice.html');

  constructor(
    private readonly pdfService: PdfService,
    private readonly minioService: MinioService,
    private readonly configService: ConfigService,
  ) {}

  private formatDateToYyyyMmDd(dateString: string): string {
    const date = new Date(dateString);
    // Adding 1 to month because getMonth() is 0-indexed, then padStart for MM and DD
    // Using toLocaleDateString with 'ja-JP' and numeric options is more robust usually,
    // but for strict YYYY/M/D or YYYY/MM/DD as in image, direct construction is safer.
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-indexed
    const day = date.getDate();
    return `${year}/${month}/${day}`;
  }

  @Mutation(() => GenerateInvoicePdfPayload)
  async generateInvoicePdf(
    @Args('input') input: GenerateInvoicePdfInput,
  ): Promise<GenerateInvoicePdfPayload> {
    this.logger.log(`Generating PDF for invoice: ${input.invoiceNo}`);

    const pdfKey = `invoices/${input.invoiceNo}.pdf`;

    try {
      const templateData = {
        INVOICE_NO: input.invoiceNo,
        PARTNER_NAME: input.partnerName,
        ISSUE_DATE: this.formatDateToYyyyMmDd(input.date),
        amount: input.amount,
        subjectText: input.subjectText,
        // dueDateText will be formatted in PdfService if passed as YYYY-MM-DD or if it uses its default
        // Pass the raw string if provided, otherwise PdfService default logic applies based on `input.date`
        dueDateText: input.dueDateText ? this.formatDateToYyyyMmDd(input.dueDateText) : undefined,
        itemDescriptionText: input.itemDescriptionText,
        date: input.date, // PdfService uses this for default due date calculation
      };

      this.logger.debug(`Template data for ${input.invoiceNo}: ${JSON.stringify(templateData)}`);

      const pdfBuffer = await this.pdfService.generatePdfFromTemplate(
        this.templatePath,
        templateData,
      );

      this.logger.log(`PDF buffer generated for ${input.invoiceNo}, uploading to MinIO...`);

      await this.minioService.uploadPdf(pdfBuffer, pdfKey);
      this.logger.log(`PDF ${pdfKey} uploaded to MinIO successfully.`);

      const presignedUrl = await this.minioService.generatePresignedGetUrl(pdfKey, 5 * 60);
      this.logger.log(`Presigned URL generated for ${pdfKey}: ${presignedUrl}`);

      return {
        pdfKey,
        presignedUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to generate invoice PDF for ${input.invoiceNo}: ${error.message}`, error.stack);
      throw error;
    }
  }
} 