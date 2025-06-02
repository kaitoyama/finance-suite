import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InvoicePdfResolver } from './invoice-pdf.resolver';
import { PdfService } from '../common/services/pdf.service';
import { MinioService } from '../storage/minio.service';
import { GenerateInvoicePdfInput } from './dto/generate-invoice-pdf.dto';
import * as path from 'path';
// Mock file system readFile to simulate template presence/absence
// jest.mock('fs/promises');

describe('InvoicePdfResolver', () => {
  let resolver: InvoicePdfResolver;
  let pdfService: jest.Mocked<PdfService>;
  let minioService: jest.Mocked<MinioService>;
  let configService: jest.Mocked<ConfigService>;

  const mockTemplatePath = path.join(
    process.cwd(),
    'api',
    'templates',
    'invoice.html',
  );

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicePdfResolver,
        {
          provide: PdfService,
          useValue: {
            generatePdfFromTemplate: jest.fn(),
          },
        },
        {
          provide: MinioService,
          useValue: {
            uploadPdf: jest.fn(),
            generatePresignedGetUrl: jest.fn(),
          },
        },
        {
          provide: ConfigService, // Mock ConfigService
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ISSUER_NAME') return 'Test Issuer';
              if (key === 'BANK_INFO') return 'Test Bank Info';
              return null;
            }),
          },
        },
      ],
    }).compile();

    resolver = module.get<InvoicePdfResolver>(InvoicePdfResolver);
    pdfService = module.get(PdfService);
    minioService = module.get(MinioService);
    configService = module.get(ConfigService); // Get the mocked ConfigService instance

    // Default mock implementations
    pdfService.generatePdfFromTemplate.mockResolvedValue(
      Buffer.from('pdf content'),
    );
    minioService.uploadPdf.mockResolvedValue(undefined);
    minioService.generatePresignedGetUrl.mockResolvedValue(
      'http://s3.com/signed-url',
    );
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  const validInput: GenerateInvoicePdfInput = {
    invoiceNo: 'INV-2025-001',
    partnerName: 'Test Partner',
    amount: 100000,
    date: '2025-01-15',
    subjectText: 'Test Subject',
    dueDateText: '2025/01/31',
    itemDescriptionText: 'Test Item',
  };

  describe('generateInvoicePdf', () => {
    it('should generate PDF, upload to MinIO, and return key with presigned URL on success', async () => {
      const result = await resolver.generateInvoicePdf(validInput);

      expect(pdfService.generatePdfFromTemplate).toHaveBeenCalledWith(
        mockTemplatePath,
        expect.objectContaining({
          INVOICE_NO: validInput.invoiceNo,
          PARTNER_NAME: validInput.partnerName,
          ISSUE_DATE: '2025/1/15',
          amount: validInput.amount,
          subjectText: validInput.subjectText,
          dueDateText: '2025/1/31',
          itemDescriptionText: validInput.itemDescriptionText,
        }),
      );
      const expectedPdfKey = `invoices/${validInput.invoiceNo}.pdf`;
      expect(minioService.uploadPdf).toHaveBeenCalledWith(
        Buffer.from('pdf content'),
        expectedPdfKey,
      );
      expect(minioService.generatePresignedGetUrl).toHaveBeenCalledWith(
        expectedPdfKey,
        300,
      );
      expect(result).toEqual({
        pdfKey: expectedPdfKey,
        presignedUrl: 'http://s3.com/signed-url',
      });
    });

    it('should return an error if MinIO upload fails', async () => {
      minioService.uploadPdf.mockRejectedValueOnce(
        new Error('MinIO Upload Failed'),
      );

      await expect(resolver.generateInvoicePdf(validInput)).rejects.toThrow(
        'MinIO Upload Failed',
      );
      expect(pdfService.generatePdfFromTemplate).toHaveBeenCalled(); // Still attempts to generate PDF
    });

    it('should return an error if template is missing (PdfService fails)', async () => {
      // Simulate PdfService failing due to template issues or other reasons
      pdfService.generatePdfFromTemplate.mockRejectedValueOnce(
        new Error('Template processing failed'),
      );

      await expect(resolver.generateInvoicePdf(validInput)).rejects.toThrow(
        'Template processing failed',
      );
      expect(minioService.uploadPdf).not.toHaveBeenCalled();
      expect(minioService.generatePresignedGetUrl).not.toHaveBeenCalled();
    });

    it('should use default subject, due date, and item description if not provided', async () => {
      const inputWithoutOptionalTexts: GenerateInvoicePdfInput = {
        invoiceNo: 'INV-2025-002',
        partnerName: 'Another Partner',
        amount: 50000,
        date: '2025-02-10',
        dueDateText: '2025-03-10',
        // subjectText, itemDescriptionText are omitted
      };

      await resolver.generateInvoicePdf(inputWithoutOptionalTexts);

      expect(pdfService.generatePdfFromTemplate).toHaveBeenCalledWith(
        mockTemplatePath,
        expect.objectContaining({
          INVOICE_NO: inputWithoutOptionalTexts.invoiceNo,
          PARTNER_NAME: inputWithoutOptionalTexts.partnerName,
          ISSUE_DATE: '2025/2/10',
          amount: inputWithoutOptionalTexts.amount,
          subjectText: undefined, // Resolver passes undefined, PdfService will use defaults
          dueDateText: undefined, // Resolver passes undefined, PdfService will use defaults
          itemDescriptionText: undefined, // Resolver passes undefined, PdfService will use defaults
          date: '2025-02-10', //This is passed to PdfService for default due date calculation
        }),
      );
    });
  });
});
