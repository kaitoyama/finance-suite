import { gql } from '@urql/core';
import { useMutation } from 'urql';

// Define the input type based on expected fields for creating an expense request
// This should align with your backend GraphQL schema's CreateExpenseRequestInput
// interface CreateExpenseRequestMutationVariables {
//   amount: number;
//   description?: string | null;
//   accountId: number;
//   attachmentId?: string | null; // Assuming attachment is optional or handled
// }

export const createExpenseRequestMutationDocument = gql`
  mutation CreateExpenseRequest($input: CreateExpenseRequestInput!) {
    submitExpenseRequest(input: $input) {
      id
    }
  }
`;

export const useCreateExpenseRequestMutation = () => {
  const [result, executeMutation] = useMutation(createExpenseRequestMutationDocument);

  return {
    result,
    executeMutation,
  };
}; 