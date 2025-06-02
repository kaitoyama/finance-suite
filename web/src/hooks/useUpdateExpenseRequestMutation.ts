import { gql } from '@urql/core';
import { useMutation } from 'urql';

export const updateExpenseRequestMutationDocument = gql`
  mutation UpdateExpenseRequest($input: UpdateExpenseRequestInput!) {
    updateExpenseRequest(input: $input) {
      id
      state
      amount
      createdAt
      description
      requester {
        id
        username
      }
      attachment {
        id
        title
        amount
      }
      account {
        id
        name
        code
      }
      category {
        id
        name
      }
    }
  }
`;

export const useUpdateExpenseRequestMutation = () => {
  const [result, executeMutation] = useMutation(
    updateExpenseRequestMutationDocument
  );

  return {
    result,
    updateExpenseRequest: executeMutation,
  };
};
