import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { InvoiceService } from './invoice.service';
import { Invoice as GqlInvoice } from './entities/invoice.entity'; // Renamed for clarity
import { InvoiceInput } from './dto/invoice.input';
import { User as PrismaUser, Invoice as PrismaInvoiceInterface } from '@prisma/client'; // Use interface for type hint
import { UserService } from '../users/user.service'; // To fetch PrismaUser
import { Logger, UnauthorizedException, InternalServerErrorException } from '@nestjs/common'; // Added Logger, UnauthorizedException, and InternalServerErrorException

// Define a type for the user object expected in the context
interface RequestUser {
  username: string;
  // Add other properties like isAdmin if they are set by your auth middleware
}

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

  @Mutation(() => GqlInvoice)
  async createInvoice(
    @Args('input') input: InvoiceInput,
    @Context() context: { req: { user?: RequestUser } }, // Make user optional and check existence
  ): Promise<GqlInvoice> {
    if (!context.req.user || !context.req.user.username) {
      this.logger.error('User information not found in request context.');
      throw new UnauthorizedException('User information not found. Cannot create invoice.');
    }

    const { username } = context.req.user;
    const prismaUser: PrismaUser | null = await this.userService.findByUsername(username);

    if (!prismaUser) {
      this.logger.error(`Authenticated user ${username} not found in database.`);
      throw new UnauthorizedException(`User ${username} not found. Cannot create invoice.`);
    }
    
    // Cast to the perceived type for defensive access, actual type is PrismaInvoiceInterface
    const createdInvoiceUntyped: any = await this.invoiceService.createInvoice(input, prismaUser);
    const createdPrismaInvoice = createdInvoiceUntyped as PerceivedPrismaInvoice;

    if (!createdPrismaInvoice.pdfKey) {
        this.logger.error(`pdfKey is null for invoice ${createdPrismaInvoice.invoiceNo}. This should not happen.`);
        throw new InternalServerErrorException('Failed to retrieve pdfKey for the invoice.');
    }

    if (!createdPrismaInvoice.dueDate) {
        this.logger.error(`dueDate is missing for invoice ${createdPrismaInvoice.invoiceNo}. This indicates a type generation issue.`);
        throw new InternalServerErrorException('Invoice created successfully, but dueDate is missing in the returned data.');
    }

    let finalAmount: number;
    if (typeof createdPrismaInvoice.amount === 'number') {
        finalAmount = createdPrismaInvoice.amount;
    } else if (createdPrismaInvoice.amount && typeof createdPrismaInvoice.amount.toNumber === 'function') {
        finalAmount = createdPrismaInvoice.amount.toNumber(); // For Prisma Decimal objects
    } else if (createdPrismaInvoice.amount) {
        finalAmount = parseFloat(createdPrismaInvoice.amount.toString());
    } else {
        this.logger.error(`Amount is missing or invalid for invoice ${createdPrismaInvoice.invoiceNo}`);
        throw new InternalServerErrorException('Invalid amount in created invoice data.');
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