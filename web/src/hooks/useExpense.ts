import { gql } from '@urql/core';
import { useQuery, UseQueryArgs } from 'urql';
import {
  ExpenseRequestByIdQuery,
  ExpenseRequestByIdQueryVariables,
} from '../gql/graphql'; // Adjust path as needed

export const GET_EXPENSE_REQUEST_BY_ID_DOCUMENT = gql`
  query ExpenseRequestById($id: Int!) {
    expenseRequest(id: $id) {
      id
      amount
      state
      createdAt
      approvedAt
      requester {
        id
        username
      }
      approver {
        id
        username
      }
      payment {
        id
        amount
        paidAt
        direction
        method
        attachments {
            id
            s3Key
            title
            amount
        }
      }
      attachment {
        id
        s3Key
        title
        amount
      }
    }
  }
`;

// Define options type for urql's useQuery, extending UseQueryArgs
// We are primarily interested in `variables` and `pause` (for skip-like behavior)
export interface UseExpenseRequestByIdArgs extends Omit<UseQueryArgs<ExpenseRequestByIdQueryVariables, ExpenseRequestByIdQuery>, 'query'> {
  variables: { id: number };
}

export const useExpenseRequestById = (options: UseExpenseRequestByIdArgs) => {
  return useQuery<ExpenseRequestByIdQuery, ExpenseRequestByIdQueryVariables>({
    query: GET_EXPENSE_REQUEST_BY_ID_DOCUMENT,
    ...options, // Spread the options object which includes variables, pause, etc.
  });
  // The return type of urql's useQuery is an array: [UseQueryState, (opts?: Partial<OperationContext>) => void]
  // The component consuming this hook will destructure it: const [result, executeQuery] = useExpenseRequestById(...)
  // For simplicity and consistency with how Apollo hooks often return an object, 
  // one might choose to transform this, but for now, let's stick to urql's direct return.
}; 