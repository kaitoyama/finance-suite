import { graphql } from "@/gql";
import { InvoiceInput } from "@/gql/graphql";
import { useMutation, useQuery } from "urql";
import React from "react";

const CreateInvoiceMutationDocument = graphql(`
    mutation createInvoice($input: InvoiceInput!) {
      createInvoice(input: $input) {
        id
        pdfKey
        status
      }
    }
  `)

const GetInvoiceByIdQueryDocument = graphql(`
  query GetInvoiceById($id: Int!) {
    invoice(id: $id) {
      id
      pdfKey
      status
      amount
      partnerName
      description
      dueDate
      invoiceNo
    }
  }
`);

const GetInvoicesQueryDocument = graphql(`
  query GetInvoices {
    invoices {
      id
      invoiceNo
      partnerName
      amount
      status
      dueDate
      createdAt
    }
  }
`);

const GetPresignedS3UrlQueryDocument = graphql(`
  query GetPresignedS3Url($key: String!) {
    getPresignedS3Url(key: $key)
  }
`);

export const useCreateInvoice = () => {
    const [result, mutate] = useMutation(CreateInvoiceMutationDocument);

    return {
        createInvoice: async (input: InvoiceInput) => {
            const { data } = await mutate({ input });
            return data?.createInvoice;
        },
        fetching: result.fetching,
        error: result.error,
    };
}

export const useGetInvoiceById = (id: number) => {
  const [{ data, fetching, error }] = useQuery({
    query: GetInvoiceByIdQueryDocument,
    variables: { id },
    pause: !id, // Don't run query if id is not available
  });

  return {
    invoice: data?.invoice,
    fetching,
    error,
  };
};

export const useGetInvoices = () => {
  const [{ data, fetching, error }] = useQuery({
    query: GetInvoicesQueryDocument,
    // Consider adding a requestPolicy, e.g., 'cache-and-network' 
    // to keep the list updated, or rely on cache updates from mutations.
  });

  return {
    invoices: data?.invoices,
    fetching,
    error,
  };
};

export const useGetPresignedS3Url = (key: string | null | undefined) => {
  const [{ data, fetching, error }, executeQuery] = useQuery({
    query: GetPresignedS3UrlQueryDocument,
    variables: { key: key || '' }, // Ensure key is not null/undefined for variables
    pause: !key, // Pause query if key is not available
    requestPolicy: 'network-only', // Presigned URLs are often short-lived, so fetch fresh
  });

  // Function to manually trigger the query if needed, though pause handles initial load
  const fetchUrl = React.useCallback(() => {
    if (key) {
      executeQuery({ requestPolicy: 'network-only' }); // Re-fetch with network-only
    }
  }, [key, executeQuery]);

  return {
    presignedUrl: data?.getPresignedS3Url,
    fetchingUrl: fetching,
    fetchUrlError: error,
    retryFetchUrl: fetchUrl, // Expose a retry mechanism
  };
};