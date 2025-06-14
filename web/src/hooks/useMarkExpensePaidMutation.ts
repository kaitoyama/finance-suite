import { gql } from '@urql/core';
import { useMutation } from 'urql';
export const markExpensePaidMutationDocument = gql`
  mutation MarkExpensePaid($input: MarkExpensePaidInput!) {
    markExpensePaid(input: $input) {
      id
      state
    }
  }
`;

export const useMarkExpensePaidMutation = () => {
  const [result, executeMutation] = useMutation(
    markExpensePaidMutationDocument
  );

  return {
    result,
    markExpensePaid: executeMutation,
  };
};
