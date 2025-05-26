import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { GraphQLProvider } from '@/providers/UrqlProvider';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from '@/components/layout/AppLayout';

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "財務管理システム",
  description: "Invoice and payment management system",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body className={geistSans.className} suppressHydrationWarning>
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