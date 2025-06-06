"use client";

import * as React from "react";
import Link from "next/link";
import { useGetInvoices } from "@/hooks/useInvoice";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component

function formatCurrency(amount: number | null | undefined) {
  if (amount == null) return "-";
  return `¥${amount.toLocaleString()}`;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
}

function getStatusVariant(status: string | undefined): "default" | "destructive" | "outline" | "secondary" {
  switch (status) {
    case "PAID":
      return "default";
    case "UNPAID":
      return "destructive";
    case "DRAFT":
      return "secondary";
    case "OVERPAY":
      return "secondary";
    case "PARTIAL":
      return "outline";
    default:
      return "default";
  }
}

export default function InvoicesPage() {
  const { invoices, fetching, error } = useGetInvoices();

  if (fetching) {
    return <div className="container mx-auto p-4 text-center">請求書一覧を読み込み中...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        エラー: {error.message}
      </div>
    );
  }

  if (!invoices || invoices.length === 0) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="mb-4">請求書はまだありません。</p>
        <Button asChild>
          <Link href="/invoices/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            新しい請求書を作成
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">請求書一覧</h1>
        <Button asChild>
          <Link href="/invoices/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            新しい請求書を作成
          </Link>
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>請求書番号</TableHead>
              <TableHead>取引先</TableHead>
              <TableHead className="text-right">金額</TableHead>
              <TableHead>ステータス</TableHead>
              <TableHead>発行日</TableHead>
              <TableHead>期日</TableHead>
              <TableHead>作成日</TableHead>
              <TableHead className="text-center">アクション</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.invoiceNo || invoice.id}</TableCell>
                <TableCell>{invoice.partnerName}</TableCell>
                <TableCell className="text-right">{formatCurrency(invoice.amount)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status?.toString())}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>{formatDate(invoice.createdAt)}</TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/invoices/${invoice.id}`} title="詳細を見る">
                      <Eye className="h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 