import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdatePaymentInput } from './dto/update-payment.input';
import {
  InvoiceStatus,
  Payment,
  PaymentLabel,
  Prisma,
  Invoice,
  PaymentDirection,
  PaymentMethod,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ExpenseService } from '../expense/expense.service';
import { JournalService } from '../journal/journal.service';
import { UserService } from '../users/user.service';

async function sendWebhook(payload: {
  type: string;
  invoiceId: number;
  paymentId: number;
  status: InvoiceStatus;
}) {
  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Failed to send webhook:', error);
    }
  } else {
    console.info('WEBHOOK_URL not set, logging to console:', payload);
  }
}

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly expenseService: ExpenseService,
    private readonly journalService: JournalService,
    private readonly userService: UserService,
  ) {}

  async getUserByUsername(username: string, isAdmin: boolean = false) {
    // Use UserService to find or create user (header values are trusted)
    return this.userService.findOrCreateByUsername(username, isAdmin);
  }

  private async createJournalEntryForPayment(
    payment: Payment,
    invoice?: Invoice | null,
    userId?: number,
  ): Promise<void> {
    // Get default accounts for automatic journal entries
    const cashAccount = await this.prisma.account.findFirst({
      where: { code: '101' }, // 現金
    });
    const bankAccount = await this.prisma.account.findFirst({
      where: { code: '102' }, // 普通預金
    });
    const receivableAccount = await this.prisma.account.findFirst({
      where: { code: '120' }, // 売掛金
    });
    const expenseAccount = await this.prisma.account.findFirst({
      where: { code: '501' }, // 仕入高 (general expense account)
    });

    if (!cashAccount || !bankAccount || !receivableAccount || !expenseAccount) {
      console.error(
        'Required accounts not found for automatic journal entry creation',
      );
      console.error('Missing accounts: ', {
        cashAccount: cashAccount ? `${cashAccount.code} - ${cashAccount.name}` : 'MISSING (code: 101)',
        bankAccount: bankAccount ? `${bankAccount.code} - ${bankAccount.name}` : 'MISSING (code: 102)',
        receivableAccount: receivableAccount ? `${receivableAccount.code} - ${receivableAccount.name}` : 'MISSING (code: 120)',
        expenseAccount: expenseAccount ? `${expenseAccount.code} - ${expenseAccount.name}` : 'MISSING (code: 501)',
      });
      console.error('Please ensure AccountBootstrapService has run successfully on application startup');
      return;
    }

    // Ensure we have a user ID for journal entry creation
    if (!userId) {
      console.error('No user ID provided for journal entry creation');
      return;
    }

    const mockUser = { id: userId };
    const amount = parseFloat(payment.amount.toString());

    try {
      if (invoice) {
        // For invoice payments: Debit Cash/Bank, Credit Receivables
        const paymentAccount =
          payment.method === PaymentMethod.CASH ? cashAccount : bankAccount;

        await this.journalService.create(
          {
            datetime: payment.paidAt,
            description: `Invoice payment received - ${invoice.invoiceNo}`,
            lines: [
              {
                accountId: paymentAccount.id,
                debit: amount,
                credit: undefined,
              },
              {
                accountId: receivableAccount.id,
                debit: undefined,
                credit: amount,
              },
            ],
          },
          mockUser as any,
        );
      } else if (payment.expenseRequestId) {
        // For expense payments: Debit Expense, Credit Cash/Bank
        const paymentAccount =
          payment.method === PaymentMethod.CASH ? cashAccount : bankAccount;

        await this.journalService.create(
          {
            datetime: payment.paidAt,
            description: `Expense payment - Request ID ${payment.expenseRequestId}`,
            lines: [
              {
                accountId: expenseAccount.id,
                debit: amount,
                credit: undefined,
              },
              {
                accountId: paymentAccount.id,
                debit: undefined,
                credit: amount,
              },
            ],
          },
          mockUser as any,
        );
      }
    } catch (error) {
      console.error('Failed to create journal entry for payment:', error);
      // Don't throw error to avoid blocking payment creation
    }
  }

  async reconcileInvoice(invoiceId: number): Promise<void> {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { payments: true },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    const totalPaid = invoice.payments.reduce(
      (sum: Decimal, p: Payment) => sum.plus(new Decimal(p.amount)),
      new Decimal(0),
    );

    let newStatus: InvoiceStatus;
    let paymentLabelForUpdate: PaymentLabel = PaymentLabel.NORMAL;
    let overpaidAmountForUpdate: Prisma.Decimal | null = null;

    const invoiceAmount = new Decimal(invoice.amount);

    if (totalPaid.equals(invoiceAmount)) {
      newStatus = InvoiceStatus.PAID;
      paymentLabelForUpdate = PaymentLabel.NORMAL;
    } else if (totalPaid.greaterThan(invoiceAmount)) {
      newStatus = InvoiceStatus.PAID;
      paymentLabelForUpdate = PaymentLabel.OVERPAY;
      overpaidAmountForUpdate = totalPaid.minus(invoiceAmount);
    } else if (totalPaid.lessThan(invoiceAmount) && totalPaid.greaterThan(0)) {
      newStatus = InvoiceStatus.PARTIAL;
      paymentLabelForUpdate = PaymentLabel.PARTIAL;
    } else {
      newStatus = InvoiceStatus.UNPAID;
      paymentLabelForUpdate = PaymentLabel.NORMAL;
    }

    const sortedPayments = invoice.payments.sort(
      (a: Payment, b: Payment) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    const lastPayment = sortedPayments.length > 0 ? sortedPayments[0] : null;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });

      if (lastPayment) {
        await tx.payment.update({
          where: { id: lastPayment.id },
          data: {
            label: paymentLabelForUpdate,
            overpaidAmount: overpaidAmountForUpdate,
          },
        });
      }
    });
  }

  async createPayment(
    createPaymentInput: CreatePaymentInput,
    userId?: number,
  ): Promise<Payment> {
    const {
      invoiceId,
      paidAt,
      amount,
      direction,
      method,
      expenseRequestId,
      attachmentIds,
    } = createPaymentInput;
    const paymentData: Prisma.PaymentUncheckedCreateInput = {
      paidAt: paidAt,
      amount: new Decimal(amount),
      label: PaymentLabel.NORMAL,
      direction: direction,
      method: method,
    };
    if (invoiceId !== undefined) {
      paymentData.invoiceId = invoiceId;
    }
    if (expenseRequestId !== undefined) {
      paymentData.expenseRequestId = expenseRequestId;
    }

    const payment = await this.prisma.payment.create({
      data: {
        ...paymentData,
        ...(attachmentIds && attachmentIds.length > 0
          ? {
              attachments: {
                create: attachmentIds.map((attId) => ({
                  attachmentId: attId,
                })),
              },
            }
          : {}),
      },
    });

    // Get invoice for journal entry if applicable
    let invoice = null;
    if (payment.invoiceId) {
      invoice = await this.prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
      });
      await this.reconcileInvoice(payment.invoiceId);
      const reconciledPayment = await this.prisma.payment.findUnique({
        where: { id: payment.id },
      });
      if (!reconciledPayment)
        throw new Error('Failed to fetch payment post-reconciliation (create)');

      const updatedInvoice = await this.prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
      });
      if (updatedInvoice) {
        await sendWebhook({
          type: 'payment',
          invoiceId: payment.invoiceId,
          paymentId: payment.id,
          status: updatedInvoice.status,
        });
      }
    }

    if (expenseRequestId && payment) {
      try {
        await this.expenseService.transitionState(expenseRequestId, {
          type: 'PAY',
          paymentId: payment.id,
        });
      } catch (error) {
        console.error(
          `Failed to transition expense request ${expenseRequestId} to PAID:`,
          error,
        );
      }
    }

    // Create journal entry for the payment
    await this.createJournalEntryForPayment(payment, invoice, userId);

    return payment;
  }

  async updatePayment(
    id: number,
    updatePaymentInput: UpdatePaymentInput,
  ): Promise<Payment> {
    const { paidAt, amount, invoiceId } = updatePaymentInput;
    const paymentUpdateData: Prisma.PaymentUpdateInput = {};

    if (paidAt !== undefined) paymentUpdateData.paidAt = paidAt;
    if (amount !== undefined) paymentUpdateData.amount = new Decimal(amount);

    if (invoiceId === null) {
      paymentUpdateData.invoice = { disconnect: true };
    } else if (invoiceId !== undefined) {
      paymentUpdateData.invoice = { connect: { id: invoiceId } };
    }

    const updatedPaymentInitial = await this.prisma.payment.update({
      where: { id },
      data: paymentUpdateData,
    });

    const currentInvoiceId = updatedPaymentInitial.invoiceId;

    if (currentInvoiceId) {
      await this.reconcileInvoice(currentInvoiceId);
      const reconciledPayment = await this.prisma.payment.findUnique({
        where: { id: updatedPaymentInitial.id },
      });
      if (!reconciledPayment)
        throw new Error('Failed to fetch payment post-reconciliation (update)');

      const updatedInvoice = await this.prisma.invoice.findUnique({
        where: { id: currentInvoiceId },
      });
      if (updatedInvoice) {
        await sendWebhook({
          type: 'payment',
          invoiceId: currentInvoiceId,
          paymentId: updatedPaymentInitial.id,
          status: updatedInvoice.status,
        });
      }
      return reconciledPayment;
    }
    return updatedPaymentInitial;
  }

  findAll(): Promise<Payment[]> {
    return this.prisma.payment.findMany();
  }

  findOne(id: number): Promise<Payment | null> {
    return this.prisma.payment.findUnique({ where: { id } });
  }

  async remove(id: number): Promise<Payment> {
    const paymentToDelete = await this.prisma.payment.findUnique({
      where: { id },
    });
    if (!paymentToDelete) {
      throw new Error('Payment not found for deletion');
    }
    const { invoiceId: invoiceIdBeforeDelete } = paymentToDelete;

    const deletedPayment = await this.prisma.payment.delete({ where: { id } });

    if (invoiceIdBeforeDelete) {
      await this.reconcileInvoice(invoiceIdBeforeDelete);
      const updatedInvoice = await this.prisma.invoice.findUnique({
        where: { id: invoiceIdBeforeDelete },
      });
      if (updatedInvoice) {
        await sendWebhook({
          type: 'payment_deleted_invoice_reconciled',
          invoiceId: invoiceIdBeforeDelete,
          paymentId: deletedPayment.id,
          status: updatedInvoice.status,
        });
      }
    }
    return deletedPayment;
  }
}
