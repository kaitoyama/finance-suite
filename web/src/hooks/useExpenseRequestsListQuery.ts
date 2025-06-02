import { graphql } from '@/gql'
import { useQuery } from 'urql';

export const expenseRequestsListQueryDocument = graphql(`
  query ExpenseRequestsList {
    expenseRequests {
      id
      amount
      state
      createdAt
      attachment {
        id
        title
      }
      # We might need more fields depending on AC-2 like requester name
      requester {
        id
        username
      }
      # Consider adding a field for attachment count if available directly
      # or retrieve attachments and count them on the client, though less ideal.
    }
  }
`);

export const useExpenseRequestsListQuery = () => {
  const [result, refetch] = useQuery({
    query: expenseRequestsListQueryDocument,
    // Add variables here if needed for pagination or filtering
  });

  return {
    data: result.data?.expenseRequests || [],
    fetching: result.fetching,
    error: result.error,
    refetch, // Exposing refetch for AC-3
  };
}; 