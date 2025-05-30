import {
  createClient,
  cacheExchange,
  fetchExchange,
} from 'urql'

export const urqlClient = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!,
  fetchOptions: {
    credentials: 'include',
  },
  exchanges: [
    cacheExchange,
    fetchExchange,
  ]
});
