import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import puppeteer, { Browser, Page } from 'puppeteer';
import * as fs from 'fs/promises';
import * as handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
  private browser: Browser | null = null;
  private readonly logger = new Logger(PdfService.name);

  constructor(private readonly configService: ConfigService) {
  }

  async onModuleInit(): Promise<void> {
    try {
      this.logger.log('Initializing Puppeteer browser instance...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--font-render-hinting=none',
          '--enable-precise-memory-info',
        ],
        // executablePath: '/usr/bin/google-chrome-stable',
      });
      this.logger.log('Puppeteer browser instance initialized successfully.');
      
      const page = await this.browser.newPage();
      await page.close();
      this.logger.log('Puppeteer browser warmed up.');

    } catch (error) {
      this.logger.error('Failed to initialize Puppeteer browser instance.', error);
      this.browser = null;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.browser) {
      this.logger.log('Closing Puppeteer browser instance...');
      await this.browser.close();
      this.browser = null;
      this.logger.log('Puppeteer browser instance closed.');
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ja-JP').format(amount);
  }

  private formatYenCurrency(amount: number): string {
    return `¥${this.formatCurrency(amount)}`;
  }
  
  async generatePdfFromTemplate(
    templatePath: string,
    data: Record<string, any>,
  ): Promise<Buffer> {
    if (!this.browser) {
      this.logger.error('Puppeteer browser is not initialized. PDF generation cannot proceed.');
      throw new Error('PDF generation service is not ready.');
    }

    let page: Page | null = null;
    try {
      const templateHtml = await fs.readFile(templatePath, 'utf-8');
      const template = handlebars.compile(templateHtml);

      const templateData = {
        ...data,
        AMOUNT_YEN: this.formatYenCurrency(data.amount),
        AMOUNT_YEN_IN_TABLE: this.formatYenCurrency(data.amount),
        ITEM_AMOUNT_FORMATTED: this.formatCurrency(data.amount),
        SUBJECT_TEXT: data.subjectText || '',
        DUE_DATE_TEXT: data.dueDateText || new Date(new Date(data.date).getFullYear(), new Date(data.date).getMonth() + 1, 0).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/'),
        ITEM_DESCRIPTION_TEXT: data.itemDescriptionText || '',
      };
      
      const htmlContent = template(templateData);

      page = await this.browser.newPage();
      await page.emulateMediaType('screen');
      await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
      await page.evaluateHandle('document.fonts.ready');

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
      });
      
      this.logger.log(`PDF generated successfully for invoice: ${data.invoiceNo}`);
      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`Error generating PDF for invoice ${data.invoiceNo}:`, error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    } finally {
      if (page) {
        await page.close();
      }
    }
  }
} 