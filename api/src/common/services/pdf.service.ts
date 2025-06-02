import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

export interface PdfTemplateData {
  invoiceNo: string;
  partnerName?: string;
  amount: number;
  date: Date | string;
  dueDate: Date | string;
  subjectText?: string;
  itemDescriptionText?: string;
  dueDateText?: string;
  [key: string]: unknown; // Allow additional properties
}

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly configService: ConfigService) {}

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ja-JP').format(amount);
  }

  private formatYenCurrency(amount: number): string {
    return `¥${this.formatCurrency(amount)}`;
  }

  async generatePdfFromTemplate(
    templatePath: string,
    data: PdfTemplateData,
  ): Promise<Buffer> {
    try {
      // __dirname is .../api/dist/common/services
      // templatePath is e.g., "invoice.html"
      // We want .../api/dist/templates/invoice.html
      const resolvedTemplatePath = path.join(
        __dirname,
        '..',
        '..',
        '..',
        templatePath,
      );
      const templateHtml = await fs.readFile(resolvedTemplatePath, 'utf-8');
      const template = handlebars.compile(templateHtml);

      const templateData = {
        ...data,
        date: new Date(data.date).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }),
        AMOUNT_YEN: this.formatYenCurrency(data.amount),
        AMOUNT_YEN_IN_TABLE: this.formatYenCurrency(data.amount),
        ITEM_AMOUNT_FORMATTED: this.formatCurrency(data.amount),
        SUBJECT_TEXT: data.subjectText || '',
        DUE_DATE_TEXT:
          data.dueDateText ||
          new Date(data.dueDate).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }),
        ITEM_DESCRIPTION_TEXT: data.itemDescriptionText || '',
      };

      const htmlContent = template(templateData);

      // Use external PDF API
      const apiKey = this.configService.get<string>('PDF_CONVERT_API_KEY');
      if (!apiKey) {
        throw new Error('PDF_CONVERT_API_KEY is not configured');
      }

      const response = await fetch('https://api.pdfg.net/v1', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ html: htmlContent }),
      });

      if (!response.ok) {
        throw new Error(
          `PDF API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const buffer = await response.arrayBuffer();

      this.logger.log(
        `PDF generated successfully for invoice: ${data.invoiceNo}`,
      );
      return Buffer.from(buffer);
    } catch (error) {
      this.logger.error(
        `Error generating PDF for invoice ${data.invoiceNo}:`,
        error,
      );
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
