'use client';
import { Provider as UrqlProvider } from 'urql';
import { urqlClient } from '@/lib/urqlClient';

export function GraphQLProvider({ children }: { children: React.ReactNode }) {
  return <UrqlProvider value={urqlClient}>{children}</UrqlProvider>;
}
