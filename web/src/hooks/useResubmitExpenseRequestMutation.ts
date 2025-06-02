import { gql } from '@urql/core';
import { useMutation } from 'urql';

export const resubmitExpenseRequestMutationDocument = gql`
  mutation ResubmitExpenseRequest($id: Int!) {
    resubmitExpenseRequest(id: $id) {
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

export const useResubmitExpenseRequestMutation = () => {
  const [result, executeMutation] = useMutation(
    resubmitExpenseRequestMutationDocument
  );

  return {
    result,
    resubmitExpenseRequest: executeMutation,
  };
};
