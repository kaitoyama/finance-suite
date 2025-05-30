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
  query GetPresignedS3Url($title: String!) {
    getPresignedS3Url(title: $title) {
      url
      objectKey
    }
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

export const useGetPresignedS3Url = (title: string | null | undefined) => {
  const [{ data, fetching, error }, executeQuery] = useQuery({
    query: GetPresignedS3UrlQueryDocument,
    variables: { title: title || '' },
    pause: !title,
    requestPolicy: 'network-only',
  });

  const fetchUrl = React.useCallback(() => {
    if (title) {
      executeQuery({ requestPolicy: 'network-only' });
    }
  }, [title, executeQuery]);

  return {
    presignedUrlData: data?.getPresignedS3Url,
    fetchingUrl: fetching,
    fetchUrlError: error,
    retryFetchUrl: fetchUrl,
  };
};