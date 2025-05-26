import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { PdfService } from '../common/services/pdf.service';
import { MinioService } from '../storage/minio.service';
import { JournalService } from '../journal/journal.service';
import { InvoiceInput } from './dto/invoice.input'; // Will create this DTO later
import { User } from '@prisma/client'; // Assuming User entity is directly from prisma client
import { Invoice, InvoiceStatus } from '@prisma/client';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly minioService: MinioService,
    private readonly journalService: JournalService,
  ) {}

  private formatJapaneseDate(date: Date): string {
    return date.toLocaleDateString('ja-JP-u-ca-japanese', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  }

  private async createJournalEntryForInvoice(
    invoice: Invoice,
    user: User,
  ): Promise<void> {
    try {
      // Get required accounts for invoice journal entry
      const receivableAccount = await this.prisma.account.findFirst({
        where: { code: '120' }, // 売掛金
      });
      const revenueAccount = await this.prisma.account.findFirst({
        where: { code: '401' }, // 売上高
      });

      if (!receivableAccount || !revenueAccount) {
        this.logger.error(
          'Required accounts not found for invoice journal entry creation',
        );
        this.logger.error('Missing accounts: ', {
          receivableAccount: receivableAccount ? `${receivableAccount.code} - ${receivableAccount.name}` : 'MISSING (code: 120)',
          revenueAccount: revenueAccount ? `${revenueAccount.code} - ${revenueAccount.name}` : 'MISSING (code: 401)',
        });
        this.logger.error('Please ensure AccountBootstrapService has run successfully on application startup');
        return;
      }

      // Create journal entry: Debit Receivables, Credit Revenue
      await this.journalService.create(
        {
          datetime: new Date(),
          description: `Invoice created - ${invoice.invoiceNo} - ${invoice.partnerName}`,
          lines: [
            {
              accountId: receivableAccount.id,
              debit: invoice.amount,
              credit: undefined,
            },
            {
              accountId: revenueAccount.id,
              debit: undefined,
              credit: invoice.amount,
            },
          ],
        },
        user,
      );

      this.logger.log(`Journal entry created for invoice ${invoice.invoiceNo}`);
    } catch (error) {
      this.logger.error(
        `Failed to create journal entry for invoice ${invoice.invoiceNo}:`,
        error,
      );
      // Don't throw error to avoid blocking invoice creation
    }
  }

  async getInvoiceById(id: number): Promise<Invoice | null> {
    return this.prisma.invoice.findUnique({
      where: { id },
    });
  }

  async getAllInvoices(): Promise<Invoice[]> {
    return this.prisma.invoice.findMany();
  }

  async createInvoice(input: InvoiceInput, user: User): Promise<Invoice> {
    const { partnerName, amount, dueDate, description } = input;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0.');
    }
    if (new Date(dueDate) < new Date()) {
      // Allowing today, so compare with start of today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(dueDate) < today) {
        throw new BadRequestException(
          'Due date must be today or a future date.',
        );
      }
    }

    // 1. Generate invoiceNo: INV-YYYY-NNNN (sequence resets per year)
    const currentYear = new Date().getFullYear();
    const lastInvoiceOfTheYear = await this.prisma.invoice.findFirst({
      where: {
        invoiceNo: {
          startsWith: `INV-${currentYear}-`,
        },
      },
      orderBy: {
        invoiceNo: 'desc',
      },
    });

    let sequence = 1;
    if (lastInvoiceOfTheYear) {
      const lastSequence = parseInt(
        lastInvoiceOfTheYear.invoiceNo.split('-')[2],
        10,
      );
      sequence = lastSequence + 1;
    }
    const invoiceNo = `INV-${currentYear}-${sequence.toString().padStart(4, '0')}`;

    // 2. Prepare data for PDF template
    const createdAt = new Date();

    // 3. Generate PDF
    const pdfTemplatePath = 'templates/invoice.html'; // Ensure this path is correct
    let pdfBuffer: Buffer;
    try {
      // The existing PdfService.generatePdfFromTemplate seems to have its own data transformation logic
      // for keys like AMOUNT_YEN. We should align with that or update PdfService.
      // For now, passing what the template expects, and also what PdfService might use for its specific keys.
      const pdfServiceData = {
        invoiceNo: invoiceNo,
        partnerName: partnerName,
        amount: amount, // raw amount for PdfService's internal formatting (e.g. AMOUNT_YEN)
        date: createdAt, // for ISSUE_DATE or similar used by PdfService
        dueDate: new Date(dueDate), // for DUE_DATE_TEXT
        subjectText: description || 'ご請求の件',
        itemDescriptionText: description || 'ご請求の件',
      };
      pdfBuffer = await this.pdfService.generatePdfFromTemplate(
        pdfTemplatePath,
        pdfServiceData,
      );
    } catch (error) {
      this.logger.error(
        `Failed to generate PDF for ${invoiceNo}: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }

    // 4. Upload PDF to MinIO
    const pdfKey = `invoices/${invoiceNo}.pdf`;
    try {
      await this.minioService.uploadPdf(pdfBuffer, pdfKey);
      this.logger.log(`PDF uploaded to MinIO for ${invoiceNo} at ${pdfKey}`);
    } catch (error) {
      this.logger.error(
        `Failed to upload PDF to MinIO for ${invoiceNo}: ${error.message}`,
        error.stack,
      );
      // Decide if we should still create the invoice record or not.
      // For now, let's throw, as pdfKey is a required field in the schema.
      throw new Error(`Failed to upload PDF to MinIO: ${error.message}`);
    }

    // 5. Save invoice to DB
    try {
      const newInvoice = await this.prisma.invoice.create({
        data: {
          invoiceNo,
          partnerName,
          amount,
          status: InvoiceStatus.UNPAID,
          pdfKey,
          createdById: user.id,
          dueDate: new Date(dueDate),
          description: description,
        },
      });
      this.logger.log(
        `Invoice ${invoiceNo} created successfully for user ${user.username}`,
      );

      // 6. Create journal entry for the invoice (Debit Receivables, Credit Revenue)
      await this.createJournalEntryForInvoice(newInvoice, user);

      return newInvoice;
    } catch (error) {
      this.logger.error(
        `Failed to save invoice ${invoiceNo} to database: ${error.message}`,
        error.stack,
      );
      // TODO: Consider deleting the PDF from MinIO if DB save fails (compensation transaction)
      throw new Error(`Failed to save invoice to database: ${error.message}`);
    }
  }
}
