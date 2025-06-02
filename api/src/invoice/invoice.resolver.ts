import { Resolver, Mutation, Args, Context, Query, Int } from '@nestjs/graphql';
import { InvoiceService } from './invoice.service';
import { Invoice as GqlInvoice, Invoice } from './entities/invoice.entity';
import { InvoiceInput } from './dto/invoice.input';
import {
  User as PrismaUser,
  Invoice as PrismaInvoice,
  InvoiceStatus,
} from '@prisma/client';
import { UserService } from '../users/user.service';
import {
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';

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

    const createdPrismaInvoice: PrismaInvoice =
      await this.invoiceService.createInvoice(input, prismaUser);

    if (!createdPrismaInvoice.pdfKey) {
      this.logger.error(
        `pdfKey is null for invoice ${createdPrismaInvoice.invoiceNo}. This should not happen.`,
      );
      throw new InternalServerErrorException(
        'Failed to retrieve pdfKey for the invoice.',
      );
    }

    return {
      id: createdPrismaInvoice.id,
      invoiceNo: createdPrismaInvoice.invoiceNo,
      partnerName: createdPrismaInvoice.partnerName,
      amount: createdPrismaInvoice.amount, // Float type in schema, no conversion needed
      status: createdPrismaInvoice.status,
      pdfKey: createdPrismaInvoice.pdfKey,
      createdAt: createdPrismaInvoice.createdAt,
      dueDate: createdPrismaInvoice.dueDate,
      description: createdPrismaInvoice.description ?? undefined,
    };
  }
}
