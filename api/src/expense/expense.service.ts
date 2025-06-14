import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  ExpenseRequest as PrismaExpenseRequest,
  Prisma,
  RequestState,
  User as PrismaUser,
} from '@prisma/client';
import {
  expenseStateMachine,
  ExpenseContext,
  ExpenseEvent,
} from './state.machine';
import {
  WebhookService,
  WebhookPayload,
} from '../common/services/webhook.service';
import {
  transition,
  MachineSnapshot,
  AnyEventObject,
  StateValue,
  AnyActorRef,
  MetaObject,
} from 'xstate';
import { isDeepStrictEqual } from 'util';
import { PubSub } from 'graphql-subscriptions';

export interface CreateExpenseRequestInput {
  amount: number;
  attachmentId: number;
  accountId?: number;
  categoryId?: number;
  description?: string;
}

export interface UpdateExpenseRequestInput {
  id: number;
  amount?: number;
  attachmentId?: number;
  accountId?: number;
  categoryId?: number;
  description?: string;
}

const expenseRequestIncludeRelations: Prisma.ExpenseRequestInclude = {
  requester: true,
  approver: false,
  payment: {
    include: {
      attachments: {
        include: {
          attachment: {
            include: {
              uploader: true,
            },
          },
        },
      },
    },
  },
  attachment: {
    include: {
      uploader: {
        select: {
          id: true,
          username: true,
          isAdmin: true,
        },
      },
    },
  },
  account: true,
  category: true,
};

type AttachmentIncludeRelations = {
  uploader: {
    select: {
      id: true;
      username: true;
      isAdmin: true;
    };
  };
};
export type AttachmentWithUploader = Prisma.AttachmentGetPayload<{
  include: AttachmentIncludeRelations;
}>;

export type FullExpenseRequest = Prisma.ExpenseRequestGetPayload<{
  include: typeof expenseRequestIncludeRelations;
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

  async findAll(): Promise<FullExpenseRequest[]> {
    return this.prisma.expenseRequest.findMany({
      include: expenseRequestIncludeRelations,
    });
  }

  async findAllPaginated(
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    items: FullExpenseRequest[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.prisma.expenseRequest.findMany({
        include: expenseRequestIncludeRelations,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.expenseRequest.count(),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return {
      items,
      totalItems,
      totalPages,
      currentPage: page,
      hasNextPage,
      hasPreviousPage,
    };
  }

  async createDraftExpenseRequest(
    input: CreateExpenseRequestInput,
    requesterUsername: string,
  ): Promise<FullExpenseRequest> {
    const requester = await this.prisma.user.findUnique({
      where: { username: requesterUsername },
    });
    if (!requester) {
      throw new NotFoundException(
        `User with username ${requesterUsername} not found`,
      );
    }
    this.logger.log(
      `User ${requester.id} creating draft expense request for amount ${input.amount}`,
    );
    return this.prisma.expenseRequest.create({
      data: {
        amount: new Prisma.Decimal(input.amount),
        attachmentId: input.attachmentId,
        requesterId: requester.id,
        accountId: input.accountId,
        categoryId: input.categoryId,
        description: input.description,
        state: 'DRAFT',
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

    const currentPrismaStateValue = expenseRequest.state;
    const machineInitialContext: ExpenseContext = {
      expenseRequest: expenseRequest as PrismaExpenseRequest,
    };

    const currentStateSnapshot: MachineSnapshot<
      ExpenseContext,
      AnyEventObject,
      Record<string, AnyActorRef>,
      StateValue,
      string,
      any,
      MetaObject,
      any
    > = expenseStateMachine.resolveState({
      value: currentPrismaStateValue,
      context: machineInitialContext,
    });

    const [nextStateSnapshot, actions]: [
      MachineSnapshot<
        ExpenseContext,
        AnyEventObject,
        Record<string, AnyActorRef>,
        StateValue,
        string,
        any,
        MetaObject,
        any
      >,
      ReadonlyArray<object>,
    ] = transition(expenseStateMachine, currentStateSnapshot, event);

    const oldStateValue = currentStateSnapshot.value as RequestState;
    const newStateValue = nextStateSnapshot.value as RequestState;

    const hasStateValueChanged = oldStateValue !== newStateValue;
    const hasContextChanged = !isDeepStrictEqual(
      machineInitialContext,
      nextStateSnapshot.context,
    );
    const hasRelevantChange =
      hasStateValueChanged || hasContextChanged || actions.length > 0;

    if (!hasRelevantChange) {
      throw new BadRequestException(
        `Invalid event: ${event.type} for current state: ${oldStateValue}. State remains ${newStateValue}, no actions generated.`,
      );
    }

    const dataToUpdate: Prisma.ExpenseRequestUpdateInput = {
      state: newStateValue,
    };
    const fireWebhook = true;

    if (event.type === 'APPROVE' && newStateValue === 'APPROVED') {
      if (!currentUser)
        throw new BadRequestException(
          'Approver user context is required for APPROVE event',
        );
      dataToUpdate.approver = { connect: { id: currentUser.id } };
      dataToUpdate.approvedAt = new Date();
    }

    if (event.type === 'PAY' && newStateValue === 'PAID') {
      if (!event.paymentId)
        throw new BadRequestException('Payment ID is required for PAY event');
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
      this.webhookService
        .sendWebhook(webhookPayload)
        .catch((err) =>
          this.logger.error('Failed to send webhook', (err as Error).stack),
        );

      await this.pubSub.publish(EXPENSE_REQUEST_STATE_CHANGED_EVENT, {
        [EXPENSE_REQUEST_STATE_CHANGED_EVENT]: updatedExpenseRequest,
      });
    }

    this.logger.log(
      `Expense request ${expenseRequestId} transitioned from ${oldStateValue} to ${newStateValue}`,
    );
    return updatedExpenseRequest;
  }

  async updateExpenseRequest(
    input: UpdateExpenseRequestInput,
    requesterUsername: string,
  ): Promise<FullExpenseRequest> {
    // First check if the expense request exists and is in REJECTED state
    const expenseRequest = await this.prisma.expenseRequest.findUnique({
      where: { id: input.id },
      include: { requester: true },
    });

    if (!expenseRequest) {
      throw new NotFoundException(
        `ExpenseRequest with ID ${input.id} not found`,
      );
    }

    // Check if the current user is the requester
    if (expenseRequest.requester.username !== requesterUsername) {
      throw new BadRequestException(
        'You can only edit your own expense requests',
      );
    }

    // Check if the expense request is in REJECTED state
    if (expenseRequest.state !== 'REJECTED') {
      throw new BadRequestException(
        'Only rejected expense requests can be edited',
      );
    }

    this.logger.log(
      `User ${requesterUsername} updating rejected expense request ${input.id}`,
    );

    // Prepare update data, only including fields that are provided
    const updateData: Prisma.ExpenseRequestUpdateInput = {};

    if (input.amount !== undefined) {
      updateData.amount = new Prisma.Decimal(input.amount);
    }
    if (input.attachmentId !== undefined) {
      updateData.attachment = { connect: { id: input.attachmentId } };
    }
    if (input.accountId !== undefined) {
      updateData.account = { connect: { id: input.accountId } };
    }
    if (input.categoryId !== undefined) {
      updateData.category = { connect: { id: input.categoryId } };
    }
    if (input.description !== undefined) {
      updateData.description = input.description;
    }

    // Update the expense request fields first
    await this.prisma.expenseRequest.update({
      where: { id: input.id },
      data: updateData,
    });

    // Then transition from REJECTED to DRAFT
    const draftExpense = await this.transitionState(input.id, { type: 'EDIT' });

    return draftExpense;
  }
}
