import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdatePaymentInput } from './dto/update-payment.input';
import { InvoiceStatus, Payment, PaymentLabel, Prisma, Invoice } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

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
  constructor(private readonly prisma: PrismaService) {}

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
    
    const sortedPayments = invoice.payments.sort((a: Payment, b: Payment) => b.createdAt.getTime() - a.createdAt.getTime());
    const lastPayment = sortedPayments.length > 0 ? sortedPayments[0] : null;

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: newStatus },
      });

      if (lastPayment) {
        await tx.payment.update({
            where: {id: lastPayment.id},
            data: {
                label: paymentLabelForUpdate,
                overpaidAmount: overpaidAmountForUpdate,
            }
        });
      }
    });
  }

  async createPayment(createPaymentInput: CreatePaymentInput): Promise<Payment> {
    const { invoiceId, paidAt, amount } = createPaymentInput;
    const paymentData: Prisma.PaymentUncheckedCreateInput = {
        paidAt: paidAt,
        amount: new Decimal(amount),
        label: PaymentLabel.NORMAL,
    };
    if (invoiceId !== undefined) {
        paymentData.invoiceId = invoiceId;
    }

    const payment = await this.prisma.payment.create({
      data: paymentData,
    });

    if (payment.invoiceId) {
      await this.reconcileInvoice(payment.invoiceId);
      const reconciledPayment = await this.prisma.payment.findUnique({ where: { id: payment.id } });
      if (!reconciledPayment) throw new Error("Failed to fetch payment post-reconciliation (create)");

      const updatedInvoice = await this.prisma.invoice.findUnique({where: {id: payment.invoiceId}});
      if (updatedInvoice) {
        await sendWebhook({
            type: 'payment',
            invoiceId: payment.invoiceId,
            paymentId: payment.id,
            status: updatedInvoice.status,
        });
      }
      return reconciledPayment;
    }    
    return payment;
  }

  async updatePayment(id: number, updatePaymentInput: UpdatePaymentInput): Promise<Payment> {
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
      const reconciledPayment = await this.prisma.payment.findUnique({ where: { id: updatedPaymentInitial.id } });
      if (!reconciledPayment) throw new Error("Failed to fetch payment post-reconciliation (update)");

      const updatedInvoice = await this.prisma.invoice.findUnique({where: {id: currentInvoiceId}});
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
    const paymentToDelete = await this.prisma.payment.findUnique({ where: { id } });
    if (!paymentToDelete) {
        throw new Error("Payment not found for deletion");
    }
    const { invoiceId: invoiceIdBeforeDelete } = paymentToDelete;

    const deletedPayment = await this.prisma.payment.delete({ where: { id } });

    if (invoiceIdBeforeDelete) {
      await this.reconcileInvoice(invoiceIdBeforeDelete);
      const updatedInvoice = await this.prisma.invoice.findUnique({where: {id: invoiceIdBeforeDelete}});
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