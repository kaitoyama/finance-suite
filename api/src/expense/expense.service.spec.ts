import { Test, TestingModule } from '@nestjs/testing';
import { ExpenseService, CreateExpenseRequestInput } from './expense.service';
import { PrismaService } from '../prisma.service';
import { WebhookService } from '../common/services/webhook.service';
import { User as PrismaUser, RequestState, Prisma } from '@prisma/client';
import { BadRequestException, NotFoundException } from '@nestjs/common';

// Mock implementations
const mockPrismaService = {
  expenseRequest: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockWebhookService = {
  sendWebhook: jest.fn(),
};

// Helper to create a mock user
const createMockUser = (id: number, username: string): PrismaUser => ({
  id,
  username,
  isAdmin: false,
  // Add other required fields for PrismaUser if any, with default values
});

// Helper to create a mock expense request
const createMockExpenseRequest = (
  id: number,
  state: RequestState,
  requesterId: number,
  amount = 100,
): Prisma.ExpenseRequestGetPayload<{
  include: { requester: true; approver: true; payment: true };
}> => ({
  id,
  amount: new Prisma.Decimal(amount),
  state,
  createdAt: new Date(),
  approvedAt: null,
  attachmentId: 1,
  requesterId,
  requester: {
    id: requesterId,
    username: `user${requesterId}`,
    isAdmin: false,
  },
  approverId: null,
  approver: null,
  paymentId: null,
  payment: null,
  description: null,
  accountId: null,
  categoryId: null,
});

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(async () => {
    // Reset mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpenseService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WebhookService, useValue: mockWebhookService },
      ],
    }).compile();

    service = module.get<ExpenseService>(ExpenseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Happy Path: DRAFT -> PENDING -> APPROVED -> PAID', () => {
    const mockUser = createMockUser(1, 'testuser');
    const mockApprover = createMockUser(2, 'testapprover');
    const createInput: CreateExpenseRequestInput = {
      amount: 100,
      attachmentId: 1,
    };
    let expenseId: number;

    it('should create a DRAFT expense request and transition to PENDING on SUBMIT', async () => {
      const draftExpense = createMockExpenseRequest(1, 'DRAFT', mockUser.id);
      const pendingExpense = {
        ...draftExpense,
        state: 'PENDING' as RequestState,
      }; // Ensure type compatibility

      mockPrismaService.expenseRequest.create.mockResolvedValue(draftExpense);
      // Mock findUnique for the first transition (SUBMIT)
      mockPrismaService.expenseRequest.findUnique.mockResolvedValueOnce(
        draftExpense,
      );
      mockPrismaService.expenseRequest.update.mockResolvedValue(pendingExpense);

      const created = await service.createDraftExpenseRequest(
        createInput,
        mockUser.username,
      );
      expect(created.state).toBe('DRAFT');
      expenseId = created.id;

      const submitted = await service.transitionState(expenseId, {
        type: 'SUBMIT',
      });
      expect(submitted.state).toBe('PENDING');
      expect(mockPrismaService.expenseRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: expenseId },
          data: { state: 'PENDING' },
        }),
      );
      expect(mockWebhookService.sendWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          newState: 'PENDING',
        }),
      );
    });

    it('should transition from PENDING to APPROVED on APPROVE', async () => {
      const pendingExpense = createMockExpenseRequest(
        expenseId,
        'PENDING',
        mockUser.id,
      );
      const approvedExpense = {
        ...pendingExpense,
        state: 'APPROVED' as RequestState,
        approverId: mockApprover.id,
        approver: mockApprover,
        approvedAt: new Date(),
      };

      mockPrismaService.expenseRequest.findUnique.mockResolvedValueOnce(
        pendingExpense,
      );
      mockPrismaService.expenseRequest.update.mockResolvedValue(
        approvedExpense,
      );

      const approved = await service.transitionState(
        expenseId,
        { type: 'APPROVE', approverId: mockApprover.id },
        mockApprover,
      );
      expect(approved.state).toBe('APPROVED');
      expect(approved.approverId).toBe(mockApprover.id);
      expect(approved.approvedAt).toBeInstanceOf(Date);
      expect(mockPrismaService.expenseRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: expenseId },
          data: {
            state: 'APPROVED',
            approver: { connect: { id: mockApprover.id } },
            approvedAt: new Date(),
          },
        }),
      );
      expect(mockWebhookService.sendWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          newState: 'APPROVED',
        }),
      );
    });

    it('should transition from APPROVED to PAID on PAY', async () => {
      const paymentId = 10;
      const approvedExpense = createMockExpenseRequest(
        expenseId,
        'APPROVED',
        mockUser.id,
      );
      // Update mock to reflect it was approved by mockApprover
      approvedExpense.approverId = mockApprover.id;
      approvedExpense.approver = mockApprover;
      approvedExpense.approvedAt = new Date();

      const paidExpense = {
        ...approvedExpense,
        state: 'PAID' as RequestState,
        paymentId,
      };

      mockPrismaService.expenseRequest.findUnique.mockResolvedValueOnce(
        approvedExpense,
      );
      mockPrismaService.expenseRequest.update.mockResolvedValue(paidExpense);

      const paid = await service.transitionState(expenseId, {
        type: 'PAY',
        paymentId,
      });
      expect(paid.state).toBe('PAID');
      expect(paid.paymentId).toBe(paymentId);
      expect(mockPrismaService.expenseRequest.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: expenseId },
          data: { state: 'PAID', payment: { connect: { id: paymentId } } },
        }),
      );
      expect(mockWebhookService.sendWebhook).toHaveBeenCalledWith(
        expect.objectContaining({
          newState: 'PAID',
        }),
      );
    });
  });

  describe('Invalid Transition: PENDING -> PAID', () => {
    it('should throw BadRequestException for PENDING to PAID transition', async () => {
      const mockUser = createMockUser(1, 'testuser');
      const pendingExpense = createMockExpenseRequest(
        1,
        'PENDING',
        mockUser.id,
      );
      mockPrismaService.expenseRequest.findUnique.mockResolvedValueOnce(
        pendingExpense,
      );

      await expect(
        service.transitionState(1, { type: 'PAY', paymentId: 100 }),
      ).rejects.toThrow(BadRequestException);
      // Ensure webhook was not called for invalid transition
      expect(mockWebhookService.sendWebhook).not.toHaveBeenCalled();
    });
  });

  describe('createDraftExpenseRequest', () => {
    it('should create and return a draft expense request', async () => {
      const mockUser = createMockUser(1, 'testuser');
      const input: CreateExpenseRequestInput = { amount: 50, attachmentId: 2 };
      const expectedResult = createMockExpenseRequest(
        1,
        'DRAFT',
        mockUser.id,
        50,
      );
      expectedResult.attachmentId = 2;

      mockPrismaService.expenseRequest.create.mockResolvedValue(expectedResult);

      const result = await service.createDraftExpenseRequest(
        input,
        mockUser.username,
      );
      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.expenseRequest.create).toHaveBeenCalledWith({
        data: {
          amount: new Prisma.Decimal(input.amount),
          attachmentId: input.attachmentId,
          requesterId: mockUser.id,
          state: 'DRAFT',
        },
        include: {
          requester: true,
          approver: true,
          payment: true,
        },
      });
    });
  });

  describe('findById', () => {
    it('should return an expense request if found', async () => {
      const mockData = createMockExpenseRequest(1, 'PENDING', 1);
      mockPrismaService.expenseRequest.findUnique.mockResolvedValue(mockData);
      const result = await service.findById(1);
      expect(result).toEqual(mockData);
      expect(mockPrismaService.expenseRequest.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          requester: true,
          approver: true,
          payment: true,
        },
      });
    });

    it('should return null if not found', async () => {
      mockPrismaService.expenseRequest.findUnique.mockResolvedValue(null);
      const result = await service.findById(99);
      expect(result).toBeNull();
    });
  });

  describe('transitionState general cases', () => {
    it('should throw NotFoundException if expense request does not exist', async () => {
      mockPrismaService.expenseRequest.findUnique.mockResolvedValue(null);
      await expect(
        service.transitionState(99, { type: 'SUBMIT' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
