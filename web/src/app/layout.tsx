import type { Metadata } from "next";
import { GraphQLProvider } from '@/providers/UrqlProvider';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';

import "./globals.css";



export const metadata: Metadata = {
  title: "財務管理システム",
  description: "Invoice and payment management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <GraphQLProvider>
          <AppLayout>
            {children}
          </AppLayout>
          <Toaster />
        </GraphQLProvider>
      </body>
    </html>
  );
}