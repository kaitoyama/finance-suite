import {
  Resolver,
  Mutation,
  Args,
  Int,
  Query,
  Context,
  Subscription,
} from '@nestjs/graphql';
// import { UseGuards } from '@nestjs/common'; // Temporarily commented out
// import { GqlAuthGuard } from '../common/guards/gql-auth.guard'; // Path TBD
// import { CurrentUser } from '../common/decorators/current-user.decorator'; // Path TBD
import { User as PrismaUser, Prisma } from '@prisma/client';
import {
  ExpenseService,
  EXPENSE_REQUEST_STATE_CHANGED_EVENT,
  FullExpenseRequest,
} from './expense.service';
import { ExpenseRequest as GQLExpenseRequest } from './entities/expense-request.entity';
import { CreateExpenseRequestInput } from './dto/create-expense-request.input';
import { MarkExpensePaidInput } from './dto/mark-expense-paid.input';
import { NotFoundException, UseGuards } from '@nestjs/common'; // Will be needed if we use a guard that populates req.user
import { PubSub } from 'graphql-subscriptions'; // Import PubSub
import { Inject } from '@nestjs/common'; // Import Inject
import { Request } from 'express';
import { PrismaService } from '../prisma.service';

// Type for the payment object when it includes its attachments (PaymentAttachment)
// and each PaymentAttachment includes the actual Attachment
type PaymentWithAttachments = Prisma.PaymentGetPayload<{
  include: {
    attachments: {
      include: {
        attachment: true;
      };
    };
  };
}>;

// Type for the individual PaymentAttachment join table entry that includes the target Attachment
type PaymentAttachmentWithRelation = Prisma.PaymentAttachmentGetPayload<{
  include: { attachment: true };
}>;

// Helper function to map Prisma ExpenseRequest to GraphQL ExpenseRequest
function mapPrismaExpenseToGql(
  prismaExpense: FullExpenseRequest | null,
): GQLExpenseRequest | null {
  if (!prismaExpense) {
    return null;
  }

  // Cast prismaExpense.payment to our more specific type if it exists
  const paymentWithIncludedAttachments = prismaExpense.payment as
    | PaymentWithAttachments
    | null
    | undefined;

  const mappedPayment = paymentWithIncludedAttachments
    ? {
        ...paymentWithIncludedAttachments,
        amount: paymentWithIncludedAttachments.amount.toNumber(),
        // Now, paymentWithIncludedAttachments.attachments should be correctly typed
        attachments:
          paymentWithIncludedAttachments.attachments?.map(
            (pa: PaymentAttachmentWithRelation) => ({
              ...pa.attachment,
              // Ensure all fields of your GQL Attachment are covered.
              // If GQL Attachment has an 'amount' field from Prisma Attachment's Decimal, convert it.
              id: pa.attachment.id, // Assuming GQL Attachment has id
              s3Key: pa.attachment.s3Key, // Assuming GQL Attachment has s3Key
              title: pa.attachment.title, // Assuming GQL Attachment has title
              // If your Attachment model has an amount field that is Decimal
              amount: pa.attachment.amount.toNumber(),
              // Add other fields from pa.attachment as needed for your GQL Attachment type
            }),
          ) || undefined,
      }
    : undefined;

  const mappedExpenseAttachment = prismaExpense.attachment
    ? {
        ...prismaExpense.attachment,
        amount: prismaExpense.attachment.amount.toNumber(),
      }
    : undefined;

  return {
    ...prismaExpense,
    amount: prismaExpense.amount.toNumber(),
    approvedAt:
      prismaExpense.approvedAt === null ? undefined : prismaExpense.approvedAt,
    requester: prismaExpense.requester as any,
    approver: (prismaExpense.approver as any) || undefined,
    payment: mappedPayment as any, // Cast to any for GQL output type, or define a GQLPaymentWithAttachments
    attachment: mappedExpenseAttachment as any, // Cast to any for GQL output type
  };
}

@Resolver(() => GQLExpenseRequest)
export class ExpenseResolver {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly prisma: PrismaService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub, // Inject PubSub
  ) {}

  // Basic query to test - get an expense request by ID
  @Query(() => GQLExpenseRequest, { name: 'expenseRequest', nullable: true })
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async getExpenseRequest(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<GQLExpenseRequest | null> {
    const prismaExpense = await this.expenseService.findById(id);
    return mapPrismaExpenseToGql(prismaExpense);
  }

  @Query(() => [GQLExpenseRequest], { name: 'expenseRequests', nullable: true })
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async getExpenseRequests(): Promise<GQLExpenseRequest[]> {
    const prismaExpenses = await this.expenseService.findAll();
    return prismaExpenses
      .map(mapPrismaExpenseToGql)
      .filter(Boolean) as GQLExpenseRequest[];
  }

  @Mutation(() => GQLExpenseRequest)
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async submitExpenseRequest(
    @Args('input') input: CreateExpenseRequestInput,
    @Context('req') req: Request,
  ): Promise<GQLExpenseRequest> {
    const username = req.username!;
    const draft = await this.expenseService.createDraftExpenseRequest(
      input,
      username,
    );
    const submittedPrisma = await this.expenseService.transitionState(
      draft.id,
      { type: 'SUBMIT' },
    );
    // The service now publishes the event, including the mapped object if needed, or resolver maps payload.
    // For simplicity, we assume the published payload from service is `FullExpenseRequest`.
    // The subscription resolver will then map it using `mapPrismaExpenseToGql`.
    return mapPrismaExpenseToGql(submittedPrisma)!;
  }

  @Mutation(() => GQLExpenseRequest)
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async approveExpenseRequest(
    @Args('id', { type: () => Int }) id: number,
    @Context('req') req: Request,
  ): Promise<GQLExpenseRequest> {
    const username = req.username!;
    const approver = await this.prisma.user.findUnique({
      where: { username },
    });
    if (!approver) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    const approvedPrisma = await this.expenseService.transitionState(
      id,
      { type: 'APPROVE', approverId: approver.id },
      approver,
    );
    return mapPrismaExpenseToGql(approvedPrisma)!;
  }

  @Mutation(() => GQLExpenseRequest)
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async rejectExpenseRequest(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<GQLExpenseRequest> {
    const rejectedPrisma = await this.expenseService.transitionState(id, {
      type: 'REJECT',
    });
    return mapPrismaExpenseToGql(rejectedPrisma)!;
  }

  @Mutation(() => GQLExpenseRequest)
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async markExpensePaid(
    @Args('input') input: MarkExpensePaidInput,
  ): Promise<GQLExpenseRequest> {
    const paidPrisma = await this.expenseService.transitionState(
      input.expenseRequestId,
      { type: 'PAY', paymentId: input.paymentId },
    );
    return mapPrismaExpenseToGql(paidPrisma)!;
  }

  @Mutation(() => GQLExpenseRequest)
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async closeExpenseRequest(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<GQLExpenseRequest> {
    const closedPrisma = await this.expenseService.transitionState(id, {
      type: 'CLOSE',
    });
    return mapPrismaExpenseToGql(closedPrisma)!;
  }

  // Subscription resolver
  @Subscription(() => GQLExpenseRequest, {
    name: EXPENSE_REQUEST_STATE_CHANGED_EVENT,
    // Optional: Add filter if clients can subscribe to specific expense request IDs
    // filter: (payload, variables) => payload[EXPENSE_REQUEST_STATE_CHANGED_EVENT].id === variables.expenseId,
    resolve: (payload) =>
      mapPrismaExpenseToGql(payload[EXPENSE_REQUEST_STATE_CHANGED_EVENT]),
  })
  expenseRequestStateChangedSubscription() {
    // @Args('expenseId', { type: () => Int, nullable: true }) expenseId?: number, // if using filter
    return (this.pubSub as any).asyncIterator(
      EXPENSE_REQUEST_STATE_CHANGED_EVENT,
    );
  }
}
