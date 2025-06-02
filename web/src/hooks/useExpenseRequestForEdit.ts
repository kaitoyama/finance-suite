import { graphql } from '@/gql';
import { useQuery } from 'urql';

export const expenseRequestForEditQueryDocument = graphql(`
  query ExpenseRequestForEdit($id: Int!) {
    expenseRequest(id: $id) {
      id
      amount
      state
      description
      createdAt
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
      attachment {
        id
        s3Key
        title
        amount
      }
    }
  }
`);

export const useExpenseRequestForEdit = (id: number) => {
  const [result, refetch] = useQuery({
    query: expenseRequestForEditQueryDocument,
    variables: { id: id || 0 },
    requestPolicy: 'cache-and-network',
    pause: !id || id <= 0 || isNaN(id), // Pause the query if id is invalid
  });

  return {
    data: result.data?.expenseRequest,
    fetching: result.fetching,
    error: result.error,
    refetch,
  };
};
