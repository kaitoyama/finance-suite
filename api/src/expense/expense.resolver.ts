import { Resolver, Mutation, Args, Int, Query, Context, Subscription } from '@nestjs/graphql';
// import { UseGuards } from '@nestjs/common'; // Temporarily commented out
// import { GqlAuthGuard } from '../common/guards/gql-auth.guard'; // Path TBD
// import { CurrentUser } from '../common/decorators/current-user.decorator'; // Path TBD
import { User as PrismaUser, Prisma } from '@prisma/client';
import { ExpenseService, EXPENSE_REQUEST_STATE_CHANGED_EVENT } from './expense.service';
import { ExpenseRequest as GQLExpenseRequest } from './entities/expense-request.entity';
import { CreateExpenseRequestInput } from './dto/create-expense-request.input';
import { MarkExpensePaidInput } from './dto/mark-expense-paid.input';
import { RequestState } from './state.machine';
import { UseGuards } from '@nestjs/common'; // Will be needed if we use a guard that populates req.user
import { PubSub } from 'graphql-subscriptions'; // Import PubSub
import { Inject } from '@nestjs/common'; // Import Inject

// Define a type for the GraphQL context to include the user from the request
interface GqlContext {
  req: {
    user?: PrismaUser; // Assuming middleware populates req.user with an object compatible with PrismaUser
  };
}

// Helper function to map Prisma ExpenseRequest to GraphQL ExpenseRequest
function mapPrismaExpenseToGql(
  prismaExpense: (Prisma.ExpenseRequestGetPayload<{include: {requester: true, approver: true, payment: true}}>) | null
): GQLExpenseRequest | null {
  if (!prismaExpense) {
    return null;
  }
  return {
    ...prismaExpense,
    amount: prismaExpense.amount.toNumber(), // Convert Decimal to number
    approvedAt: prismaExpense.approvedAt === null ? undefined : prismaExpense.approvedAt, // Convert null to undefined
    // Ensure related objects are also mapped if their GQL types differ from Prisma types
    // For User and Payment, if they are simple pass-throughs and types align, direct spread is fine.
    // If they also have Decimal or other incompatible types, they'd need mapping too.
    // Assuming User and Payment entities are compatible for now.
    requester: prismaExpense.requester as any, // Cast if PrismaUser and GQL User differ significantly
    approver: prismaExpense.approver as any || undefined, // Cast and handle null
    payment: prismaExpense.payment as any || undefined, // Cast and handle null
  };
}

@Resolver(() => GQLExpenseRequest)
export class ExpenseResolver {
  constructor(
    private readonly expenseService: ExpenseService,
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

  @Mutation(() => GQLExpenseRequest)
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async submitExpenseRequest(
    @Args('input') input: CreateExpenseRequestInput,
    @Context() context: GqlContext, 
  ): Promise<GQLExpenseRequest> {
    const user = context.req.user;
    if (!user || !user.id) {
      throw new Error('User not found in request context. Ensure authentication middleware is active.');
    }
    const draft = await this.expenseService.createDraftExpenseRequest(input, user);
    const submittedPrisma = await this.expenseService.transitionState(draft.id, { type: 'SUBMIT' });
    // The service now publishes the event, including the mapped object if needed, or resolver maps payload.
    // For simplicity, we assume the published payload from service is `FullExpenseRequest`.
    // The subscription resolver will then map it using `mapPrismaExpenseToGql`.
    return mapPrismaExpenseToGql(submittedPrisma)!;
  }

  @Mutation(() => GQLExpenseRequest)
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async approveExpenseRequest(
    @Args('id', { type: () => Int }) id: number,
    @Context() context: GqlContext,
  ): Promise<GQLExpenseRequest> {
    const user = context.req.user;
    if (!user || !user.id) {
      throw new Error('User not found in request context for approval. Ensure authentication middleware is active.');
    }
    const approvedPrisma = await this.expenseService.transitionState(id, { type: 'APPROVE', approverId: user.id }, user);
    return mapPrismaExpenseToGql(approvedPrisma)!;
  }

  @Mutation(() => GQLExpenseRequest)
  // @UseGuards(GqlAuthGuard) // Temporarily commented out
  async rejectExpenseRequest(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<GQLExpenseRequest> {
    const rejectedPrisma = await this.expenseService.transitionState(id, { type: 'REJECT' });
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
    const closedPrisma = await this.expenseService.transitionState(id, { type: 'CLOSE' });
    return mapPrismaExpenseToGql(closedPrisma)!;
  }

  // Subscription resolver
  @Subscription(() => GQLExpenseRequest, {
    name: EXPENSE_REQUEST_STATE_CHANGED_EVENT,
    // Optional: Add filter if clients can subscribe to specific expense request IDs
    // filter: (payload, variables) => payload[EXPENSE_REQUEST_STATE_CHANGED_EVENT].id === variables.expenseId,
    resolve: (payload) => mapPrismaExpenseToGql(payload[EXPENSE_REQUEST_STATE_CHANGED_EVENT]),
  })
  expenseRequestStateChangedSubscription(
    // @Args('expenseId', { type: () => Int, nullable: true }) expenseId?: number, // if using filter
  ) {
    return (this.pubSub as any).asyncIterator(EXPENSE_REQUEST_STATE_CHANGED_EVENT);
  }
} 