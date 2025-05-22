import { gql } from '@urql/core';
import { useMutation } from 'urql';

export const rejectExpenseRequestMutationDocument = gql`
  mutation RejectExpenseRequest($id: Int!) {
    rejectExpenseRequest(id: $id) {
      id
      state
    }
  }
`;

export const useRejectExpenseRequestMutation = () => {
  const [result, executeMutation] = useMutation(
    rejectExpenseRequestMutationDocument
  );

  return {
    result,
    rejectExpenseRequest: executeMutation,
  };
}; 