import { CreateJournalEntryInput } from "@/gql/graphql";
import { graphql } from '@/gql';
import { useMutation, useQuery } from "urql";

const createJournalEntryMutationDocument = graphql(`
  mutation CreateJournalEntry($createJournalEntryInput: CreateJournalEntryInput!) {
    createJournalEntry(createJournalEntryInput: $createJournalEntryInput) {
      id
      datetime
      description
      lines {
        id
        accountId
        debit
        credit
      }
    }
  }
`);

export const useCreateJournalEntry = () => {
  const [result, mutate] = useMutation(createJournalEntryMutationDocument);

  return {
    loading: result.fetching,
    error: result.error,
    createJournalEntry: async (createJournalEntryInput:CreateJournalEntryInput) => {
      const { data } = await mutate({ createJournalEntryInput });
      if (data?.createJournalEntry) {
        return data.createJournalEntry;
      }
      throw new Error("Failed to create journal entry");
    },
  };
}

const getJournalEntriesQueryDocument = graphql(`
  query GetJournalEntries {
    journalEntries {
      id
      datetime
      description
      createdById
      lines {
        id
        accountId
        debit
        credit
        account {
          id
          name
          code
          category
        }
      }
    }
  }
`);

export const useGetJournalEntries = () => {
  const [result] = useQuery({
    query: getJournalEntriesQueryDocument,
  });

  return {
    journalEntries: result.data?.journalEntries,
    loading: result.fetching,
    error: result.error,
  };
};
