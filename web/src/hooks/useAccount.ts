import { graphql } from '@/gql';
import { CreateAccountInput } from '@/gql/graphql';
import { useMutation, useQuery } from 'urql';

// Fragment for consistent Account data
// graphql-codegenが自動で `AccountPartsFragment` という型を生成してくれる
graphql(`
  fragment AccountParts on Account {
    id
    code
    name
    category
  }
`);

const CreateAccountMutationDocument = graphql(`
  mutation createAccount($createAccountInput: CreateAccountInput!) {
    createAccount(createAccountInput: $createAccountInput) {
      ...AccountParts
    }
  }
`);

const GetAccountsQueryDocument = graphql(`
  query getAccounts {
    accounts {
      ...AccountParts
    }
  }
`);

const GetAccountByIdQueryDocument = graphql(`
  query getAccountById($id: Int!) {
    account(id: $id) {
      ...AccountParts
    }
  }
`);

export const useCreateAccount = () => {
  const [result, mutate] = useMutation(CreateAccountMutationDocument);

  return {
    loading: result.fetching,
    error: result.error,
    createAccount: async (createAccountInput: CreateAccountInput) => {
      const { data, error } = await mutate({ createAccountInput });
      if (error) {
        console.error('Error creating account:', error);
        throw error;
      }
      if (data?.createAccount) {
        return data.createAccount;
      }
      throw new Error('Failed to create account');
    },
  };
};

export const useGetAccounts = () => {
  const [result, refetchAccounts] = useQuery({
    query: GetAccountsQueryDocument,
  });

  return {
    loading: result.fetching,
    error: result.error,
    accounts: result.data?.accounts,
    refetchAccounts,
  };
};

export const useGetAccountById = (id: number | undefined) => {
  const [result, refetchAccount] = useQuery({
    query: GetAccountByIdQueryDocument,
    variables: { id: id! },
    pause: !id, // idが指定されるまでクエリを停止
  });

  return {
    loading: result.fetching,
    error: result.error,
    account: result.data?.account,
    refetchAccount,
  };
}; 