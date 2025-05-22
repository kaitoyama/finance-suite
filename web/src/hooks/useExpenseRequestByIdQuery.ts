import { gql } from '@urql/core';
import { useQuery } from 'urql';

export const EXPENSE_REQUEST_BY_ID_QUERY = gql`
  query ExpenseRequestById($id: Int!) {
    expenseRequest(id: $id) {
      id,
      amount,
      state,
      createdAt,
      attachmentId,
      approver {
        id,
        username,
      },
      requester {
        id,
        username,
      },
      payment {
        id,
        amount,
        label,
        paidAt,
      },
    }
  }
`; 

export const useExpenseRequestByIdQuery = (id: number) => {
  const [{ data, fetching, error }, refetch] = useQuery({
    query: EXPENSE_REQUEST_BY_ID_QUERY,
    variables: { id },
  });

  return {
    data,
    fetching,
    error,
  };
};
