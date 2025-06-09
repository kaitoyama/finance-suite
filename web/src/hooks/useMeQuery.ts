import { graphql } from '@/gql';
import { useQuery } from 'urql';

export const meQueryDocument = graphql(`
  query Me {
    me {
      username
      isAdmin
    }
  }
`);

export const useMeQuery = () => {
  const [result, reexecuteQuery] = useQuery({ query: meQueryDocument });

  return {
    user: result.data?.me ?? null,
    fetching: result.fetching,
    error: result.error,
    refetch: reexecuteQuery,
  };
};
