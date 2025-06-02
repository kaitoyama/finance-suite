import { gql } from '@urql/core';
import { useQuery } from 'urql';

export const expenseRequestDetailQueryDocument = gql`
  query ExpenseRequestDetail($id: Int!) {
    expenseRequest(id: $id) {
      id
      amount
      state
      createdAt
      approvedAt
      description
      requester {
        id
        username
      }
      approver {
        id
        username
      }
      attachment {
        id
        title
        amount
        createdAt
        uploader {
          id
          username
        }
      }
      account {
        id
        name
        code
      }
      category {
        id
        name
        description
      }
      payment {
        id
        amount
        paidAt
        method
        label
      }
    }
  }
`;

export const useExpenseRequestDetailQuery = (id: number) => {
  const [{ data, fetching, error }, refetch] = useQuery({
    query: expenseRequestDetailQueryDocument,
    variables: { id },
  });

  return {
    data,
    fetching,
    error,
    refetch,
  };
};
