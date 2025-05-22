import { gql } from '@urql/core';
import { useMutation } from 'urql';

export const approveExpenseRequestMutationDocument = gql`
  mutation ApproveExpenseRequest($id: Int!) {
    approveExpenseRequest(id: $id) {
      id
      state
    }
  }
`;

export const useApproveExpenseRequestMutation = () => {
  const [result, executeMutation] = useMutation(
    approveExpenseRequestMutationDocument
  );

  return {
    result,
    approveExpenseRequest: executeMutation,
  };
}; 