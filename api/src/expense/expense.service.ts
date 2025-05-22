import { Injectable, Logger, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ExpenseRequest as PrismaExpenseRequest, Prisma, RequestState, User as PrismaUser } from '@prisma/client';
import { expenseStateMachine, ExpenseContext, ExpenseEvent, ExpenseStateValue } from './state.machine';
import { WebhookService, WebhookPayload } from '../common/services/webhook.service';
import { transition, MachineSnapshot, AnyEventObject, StateValue, AnyActorRef, MetaObject } from 'xstate';
import { isDeepStrictEqual } from 'util';
import { PubSub } from 'graphql-subscriptions';

// Placeholder for DTOs to be created later
export interface CreateExpenseRequestInput {
  amount: number;
  attachmentId: number;
  // requesterId will be taken from the authenticated user
  description?: string; // Added description as an example optional field
}

const expenseRequestIncludeRelations: Prisma.ExpenseRequestInclude = {
  requester: true,
  approver: true,
  payment: true,
  // attachment: true, // Add if/when Attachment entity is used and relation is direct
};

// This type should correctly reflect that requester, approver, payment are objects
// and attachmentId is a scalar. attachment object itself is not included.
type FullExpenseRequest = Prisma.ExpenseRequestGetPayload<{
  include: typeof expenseRequestIncludeRelations
}>;

export const EXPENSE_REQUEST_STATE_CHANGED_EVENT = 'expenseRequestStateChanged';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookService: WebhookService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  async findById(id: number): Promise<FullExpenseRequest | null> {
    this.logger.log(`Finding expense request with ID: ${id}`);
    return this.prisma.expenseRequest.findUnique({
      where: { id },
      include: expenseRequestIncludeRelations,
    });
  }

  async createDraftExpenseRequest(
    input: CreateExpenseRequestInput,
    requester: PrismaUser,
  ): Promise<FullExpenseRequest> {
    this.logger.log(`User ${requester.id} creating draft expense request for amount ${input.amount}`);
    return this.prisma.expenseRequest.create({
      data: {
        amount: new Prisma.Decimal(input.amount),
        attachmentId: input.attachmentId,
        requesterId: requester.id,
        state: 'DRAFT',
        // description: input.description, // If you add description to model
      },
      include: expenseRequestIncludeRelations,
    });
  }

  async transitionState(
    expenseRequestId: number,
    event: ExpenseEvent,
    currentUser?: PrismaUser,
  ): Promise<FullExpenseRequest> {
    this.logger.log(
      `Attempting to transition state for expense request ${expenseRequestId} with event ${JSON.stringify(event)}`,
    );
    const expenseRequest = await this.prisma.expenseRequest.findUnique({
      where: { id: expenseRequestId },
      include: expenseRequestIncludeRelations,
    });

    if (!expenseRequest) {
      throw new NotFoundException(
        `ExpenseRequest with ID ${expenseRequestId} not found`,
      );
    }

    const currentPrismaStateValue = expenseRequest.state as ExpenseStateValue;
    const machineInitialContext: ExpenseContext = { expenseRequest: expenseRequest as PrismaExpenseRequest };

    const currentStateSnapshot: MachineSnapshot<ExpenseContext, AnyEventObject, Record<string, AnyActorRef>, StateValue, string, any, MetaObject, any> = expenseStateMachine.resolveState({
      value: currentPrismaStateValue,
      context: machineInitialContext,
    });

    const [nextStateSnapshot, actions]: [MachineSnapshot<ExpenseContext, AnyEventObject, Record<string, AnyActorRef>, StateValue, string, any, MetaObject, any>, ReadonlyArray<object>] = transition(expenseStateMachine, currentStateSnapshot, event);

    const oldStateValue = currentStateSnapshot.value as RequestState;
    const newStateValue = nextStateSnapshot.value as RequestState;

    const hasStateValueChanged = oldStateValue !== newStateValue;
    const hasContextChanged = !isDeepStrictEqual(machineInitialContext, nextStateSnapshot.context);
    const hasRelevantChange = hasStateValueChanged || hasContextChanged || actions.length > 0;

    if (!hasRelevantChange) {
      throw new BadRequestException(
        `Invalid event: ${event.type} for current state: ${oldStateValue}. State remains ${newStateValue}, no actions generated.`
      );
    }

    const dataToUpdate: Prisma.ExpenseRequestUpdateInput = { state: newStateValue };
    let fireWebhook = true;

    if (event.type === 'APPROVE' && newStateValue === 'APPROVED') {
      if (!currentUser) throw new BadRequestException('Approver user context is required for APPROVE event');
      dataToUpdate.approver = { connect: { id: currentUser.id } };
      dataToUpdate.approvedAt = new Date();
    }

    if (event.type === 'PAY' && newStateValue === 'PAID') {
      if (!event.paymentId) throw new BadRequestException('Payment ID is required for PAY event');
      dataToUpdate.payment = { connect: { id: event.paymentId } };
    }

    const updatedExpenseRequest = await this.prisma.expenseRequest.update({
      where: { id: expenseRequestId },
      data: dataToUpdate,
      include: expenseRequestIncludeRelations,
    });

    if (fireWebhook) {
      const webhookPayload: WebhookPayload = {
        type: 'EXPENSE_STATE_CHANGE',
        id: expenseRequestId,
        oldState: oldStateValue,
        newState: newStateValue,
        data: updatedExpenseRequest,
      };
      this.webhookService.sendWebhook(webhookPayload)
        .catch(err => this.logger.error('Failed to send webhook', err.stack));
      
      this.pubSub.publish(EXPENSE_REQUEST_STATE_CHANGED_EVENT, { 
        [EXPENSE_REQUEST_STATE_CHANGED_EVENT]: updatedExpenseRequest 
      });
    }

    this.logger.log(
      `Expense request ${expenseRequestId} transitioned from ${oldStateValue} to ${newStateValue}`,
    );
    return updatedExpenseRequest;
  }
} 