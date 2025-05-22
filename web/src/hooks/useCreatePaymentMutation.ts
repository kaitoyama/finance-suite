import { CreatePaymentInput } from '@/gql/graphql';
import { gql } from '@urql/core';
import { useMutation } from 'urql';

export const createPaymentMutationDocument = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(createPaymentInput: $input) {
      id
      paidAt
      amount
      label
      # invoice and invoiceId are available if needed
      # The API design implies that ExpenseRequest status change is a side-effect handled by the backend,
      # not directly returned by createPayment. We'll rely on re-fetching or optimistic UI for that.
    }
  }
`; 

export const useCreatePaymentMutation = () => {
  const [result, mutate] = useMutation(createPaymentMutationDocument);

  return {
    loading: result.fetching,
    error: result.error,
    createPayment: async (input: CreatePaymentInput) => {
      const { data } = await mutate({ input });
      if (data?.createPayment) {
        return data.createPayment;
      }
      throw new Error("Failed to create payment");
    },
  };
};
