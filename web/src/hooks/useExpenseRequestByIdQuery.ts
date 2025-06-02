import { graphql } from '@/gql'
import { useQuery } from 'urql';

export const expenseRequestByIdQueryDocument = graphql(`
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
`); 

export const useExpenseRequestByIdQuery = (id: number) => {
  const [result, refetch] = useQuery({
    query: expenseRequestByIdQueryDocument,
    variables: { id },
  });

  return {
    data: result.data?.expenseRequest,
    fetching: result.fetching,
    error: result.error,
    refetch,
  };
};
