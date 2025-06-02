import { createMachine } from 'xstate';
import {
  ExpenseRequest,
  RequestState as PrismaRequestState,
} from '@prisma/client';

export interface ExpenseContext {
  expenseRequest?: ExpenseRequest;
  error?: Error | string | null;
}

export type ExpenseEvent =
  | { type: 'SUBMIT' }
  | { type: 'APPROVE'; approverId: number }
  | { type: 'REJECT' }
  | { type: 'PAY'; paymentId: number }
  | { type: 'CLOSE' }
  | { type: 'EDIT' };

export type ExpenseStateValue = PrismaRequestState;
export type RequestState = PrismaRequestState;

// Simplified machine definition focusing on state transitions
export const expenseStateMachine = createMachine({
  id: 'expenseRequest',
  initial: 'DRAFT',
  // schema: { // Optional: Define schema for context and events for better type checking if needed
  //   context: {} as ExpenseContext,
  //   events: {} as ExpenseEvent,
  // },
  // Type cast for context if needed, or rely on inference
  context: {
    expenseRequest: undefined,
    error: undefined,
  } as ExpenseContext,
  states: {
    DRAFT: {
      on: {
        SUBMIT: { target: 'PENDING' },
      },
    },
    PENDING: {
      on: {
        APPROVE: { target: 'APPROVED' },
        REJECT: { target: 'REJECTED' },
      },
    },
    APPROVED: {
      on: {
        PAY: { target: 'PAID' },
      },
    },
    PAID: {
      on: {
        CLOSE: { target: 'CLOSED' },
      },
    },
    REJECTED: {
      on: {
        EDIT: { target: 'DRAFT' },
      },
    },
    CLOSED: {
      type: 'final',
    },
  },
});
