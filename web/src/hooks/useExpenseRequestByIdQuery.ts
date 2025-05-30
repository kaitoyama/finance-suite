import { gql } from '@urql/core';
import { useQuery } from 'urql';

export const expenseRequestByIdQueryDocument = gql`
  query SimpleExpenseRequestById($id: Int!) {
    expenseRequest(id: $id) {
      id,
      amount,
      state,
      createdAt,
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
  const [{ data, fetching, error }] = useQuery({
    query: expenseRequestByIdQueryDocument,
    variables: { id },
  });

  return {
    data,
    fetching,
    error,
  };
};
