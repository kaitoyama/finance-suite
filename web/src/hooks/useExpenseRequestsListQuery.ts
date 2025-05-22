import { gql } from '@urql/core';
import { useQuery } from 'urql';

export const expenseRequestsListQueryDocument = gql`
  query ExpenseRequestsList {
    expenseRequests {
      id
      amount
      state
      createdAt
      attachmentId # Assuming we want to show if there's an attachment or count
      # We might need more fields depending on AC-2 like requester name
      requester {
        id
        username
      }
      # Consider adding a field for attachment count if available directly
      # or retrieve attachments and count them on the client, though less ideal.
    }
  }
`;

export const useExpenseRequestsListQuery = () => {
  const [{ data, fetching, error }, refetch] = useQuery({
    query: expenseRequestsListQueryDocument,
    // Add variables here if needed for pagination or filtering
  });

  return {
    data,
    fetching,
    error,
    refetch, // Exposing refetch for AC-3
  };
}; 