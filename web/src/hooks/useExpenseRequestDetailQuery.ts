import { graphql } from '@/gql';
import { useQuery } from 'urql';

export const expenseRequestDetailQueryDocument = graphql(`
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
        s3Key
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
        direction
        attachments {
          id
          s3Key
          title
          amount
          createdAt
          uploader {
            id
            username
          }
        }
      }
    }
  }
`);

export const useExpenseRequestDetailQuery = (id: number) => {
  const [result, refetch] = useQuery({
    query: expenseRequestDetailQueryDocument,
    variables: { id: id || 0 },
    pause: !id || id <= 0 || isNaN(id), // Pause the query if id is invalid
  });

  return {
    data: result.data?.expenseRequest,
    fetching: result.fetching,
    error: result.error,
    refetch,
  };
};
