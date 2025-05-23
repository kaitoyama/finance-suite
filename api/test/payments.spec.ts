import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from '../src/payments/payments.service';
import { PrismaService } from '../src/prisma.service';
import { CreatePaymentInput } from '../src/payments/dto/create-payment.input';
import { PaymentDirection, PaymentMethod, PaymentLabel } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let prisma: PrismaService;
  let validationPipe: ValidationPipe;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaymentsService, PrismaService],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    prisma = module.get<PrismaService>(PrismaService);
    validationPipe = new ValidationPipe({ transform: true, whitelist: true });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPayment', () => {
    it('should successfully create a payment with direction OUT', async () => {
      const createPaymentInput: CreatePaymentInput = {
        paidAt: new Date(),
        amount: 100,
        direction: PaymentDirection.OUT,
        method: PaymentMethod.BANK,
      };

      const mockPayment = {
        id: 1,
        ...createPaymentInput,
        amount: new Decimal(createPaymentInput.amount), // Ensure amount is Decimal
        label: PaymentLabel.NORMAL,
        createdAt: new Date(),
        updatedAt: new Date(),
        invoiceId: null,
        overpaidAmount: null,
        expenseRequestId: null,
        attachments: [],
      };
      jest
        .spyOn(prisma.payment, 'create')
        .mockResolvedValue(mockPayment as any); // any for attachments if not modeled precisely

      const result = await service.createPayment(createPaymentInput);
      expect(result).toEqual(mockPayment);
      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          paidAt: createPaymentInput.paidAt,
          amount: new Decimal(createPaymentInput.amount),
          direction: createPaymentInput.direction,
          method: createPaymentInput.method,
          label: PaymentLabel.NORMAL,
          expenseRequestId: undefined, // or null if that's the default
          attachments: undefined, // or an empty object for create relation
        },
      });
    });

    it('should throw a validation error if direction is omitted', async () => {
      const createPaymentInput: any = {
        // Use any to allow missing properties
        paidAt: new Date(),
        amount: 100,
        method: PaymentMethod.CASH,
      };
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: CreatePaymentInput,
      };
      try {
        await validationPipe.transform(createPaymentInput, metadata);
      } catch (e) {
        expect(e.getResponse().message).toContain(
          'direction should not be empty',
        );
        expect(e.getResponse().message).toContain(
          'direction must be one of the following values: IN, OUT',
        );
      }
    });

    it('should throw a validation error if method is omitted', async () => {
      const createPaymentInput: any = {
        // Use any to allow missing properties
        paidAt: new Date(),
        amount: 100,
        direction: PaymentDirection.IN,
      };
      const metadata: ArgumentMetadata = {
        type: 'body',
        metatype: CreatePaymentInput,
      };
      try {
        await validationPipe.transform(createPaymentInput, metadata);
      } catch (e) {
        expect(e.getResponse().message).toContain('method should not be empty');
        expect(e.getResponse().message).toContain(
          'method must be one of the following values: BANK, CASH, OTHER',
        );
      }
    });
  });
});
