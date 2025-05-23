import { Resolver, Mutation, Args, Context, Query, Int } from '@nestjs/graphql';
import { InvoiceService } from './invoice.service';
import { Invoice as GqlInvoice, Invoice } from './entities/invoice.entity'; // Renamed for clarity
import { InvoiceInput } from './dto/invoice.input';
import {
  User as PrismaUser,
  Invoice as PrismaInvoiceInterface,
} from '@prisma/client'; // Use interface for type hint
import { UserService } from '../users/user.service'; // To fetch PrismaUser
import {
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common'; // Added Logger, UnauthorizedException, and InternalServerErrorException
import { Request } from 'express';

// This is what the linter seems to think PrismaInvoice is. For robustnes, we defensively access properties.
interface PerceivedPrismaInvoice {
  id: number;
  invoiceNo: string;
  partnerName: string;
  amount: any; // Prisma's Decimal might be 'any' or specific object here
  status: any; // Prisma.InvoiceStatus
  pdfKey: string | null;
  createdAt: Date;
  dueDate?: Date; // Make optional based on linter error
  description?: string | null; // Make optional based on linter error
  // createdById: number; // Not in GQL type
  // journalEntryId?: number | null; // Not in GQL type
}

@Resolver(() => GqlInvoice)
export class InvoiceResolver {
  private readonly logger = new Logger(InvoiceResolver.name); // Added logger

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly userService: UserService,
  ) {}

  @Query(() => Invoice)
  async invoice(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<Invoice | null> {
    const invoiceFromService = await this.invoiceService.getInvoiceById(id);
    if (!invoiceFromService) {
      throw new NotFoundException('Invoice not found');
    }
    // Transform the description field to match GraphQL type (string | undefined)
    return {
      ...invoiceFromService,
      description: invoiceFromService.description ?? undefined,
    };
  }

  @Query(() => [Invoice])
  async invoices(): Promise<Invoice[]> {
    const invoicesFromService = await this.invoiceService.getAllInvoices();
    // Transform the description field for each invoice
    return invoicesFromService.map((invoice) => ({
      ...invoice,
      description: invoice.description ?? undefined,
    }));
  }

  @Mutation(() => GqlInvoice)
  async createInvoice(
    @Args('input') input: InvoiceInput,
    @Context('req') req: Request,
  ): Promise<GqlInvoice> {
    const username = req.username;
    const isAdmin = req.isAdmin;

    if (!username) {
      this.logger.error('Username not found in request context.');
      throw new UnauthorizedException(
        'User information (username) not found. Cannot create invoice.',
      );
    }

    // Explicitly check for isAdmin, assuming it's a boolean
    if (typeof isAdmin !== 'boolean') {
      this.logger.error(
        'User admin status (isAdmin) not found or invalid in request context.',
      );
      throw new UnauthorizedException(
        'User information (admin status) not found or invalid. Cannot create invoice.',
      );
    }

    // Use findOrCreateByUsername as in journal.resolver.ts
    const prismaUser: PrismaUser | null =
      await this.userService.findOrCreateByUsername(username, isAdmin);

    if (!prismaUser) {
      // This case might be less likely if findOrCreateByUsername always returns a user or throws
      this.logger.error(`User ${username} could not be found or created.`);
      throw new UnauthorizedException(
        `User ${username} could not be processed. Cannot create invoice.`,
      );
    }

    const createdInvoiceUntyped: any = await this.invoiceService.createInvoice(
      input,
      prismaUser,
    );
    const createdPrismaInvoice =
      createdInvoiceUntyped as PerceivedPrismaInvoice;

    if (!createdPrismaInvoice.pdfKey) {
      this.logger.error(
        `pdfKey is null for invoice ${createdPrismaInvoice.invoiceNo}. This should not happen.`,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve pdfKey for the invoice.',
      );
    }

    if (!createdPrismaInvoice.dueDate) {
      this.logger.error(
        `dueDate is missing for invoice ${createdPrismaInvoice.invoiceNo}. This indicates a type generation issue.`,
      );
      throw new InternalServerErrorException(
        'Invoice created successfully, but dueDate is missing in the returned data.',
      );
    }

    let finalAmount: number;
    if (typeof createdPrismaInvoice.amount === 'number') {
      finalAmount = createdPrismaInvoice.amount;
    } else if (
      createdPrismaInvoice.amount &&
      typeof createdPrismaInvoice.amount.toNumber === 'function'
    ) {
      finalAmount = createdPrismaInvoice.amount.toNumber(); // For Prisma Decimal objects
    } else if (createdPrismaInvoice.amount) {
      finalAmount = parseFloat(createdPrismaInvoice.amount.toString());
    } else {
      this.logger.error(
        `Amount is missing or invalid for invoice ${createdPrismaInvoice.invoiceNo}`,
      );
      throw new InternalServerErrorException(
        'Invalid amount in created invoice data.',
      );
    }

    return {
      id: createdPrismaInvoice.id,
      invoiceNo: createdPrismaInvoice.invoiceNo,
      partnerName: createdPrismaInvoice.partnerName,
      amount: finalAmount,
      status: createdPrismaInvoice.status, // Assumes GqlInvoice.status is compatible with PrismaInvoice.status
      pdfKey: createdPrismaInvoice.pdfKey, // Now checked for nullity
      createdAt: createdPrismaInvoice.createdAt,
      dueDate: createdPrismaInvoice.dueDate, // Now checked for existence
      description: createdPrismaInvoice.description ?? undefined,
    };
  }
}
