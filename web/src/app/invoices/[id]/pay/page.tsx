"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetInvoiceById } from "@/hooks/useInvoice";
import { useCreatePaymentMutation } from "@/hooks/useCreatePaymentMutation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";
import toast from "react-hot-toast";

const paymentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paidAt: z.string().min(1, "Payment date is required"),
  direction: z.enum(["IN", "OUT"]),
  method: z.enum(["BANK", "CASH", "OTHER"]),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function InvoicePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const id = parseInt(params.id as string, 10);
  
  const { invoice, fetching: fetchingInvoice, error: invoiceError } = useGetInvoiceById(id);
  const { createPayment, loading } = useCreatePaymentMutation();
  
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paidAt: new Date().toISOString().split('T')[0],
      direction: "IN",
      method: "BANK",
    },
  });

  React.useEffect(() => {
    if (invoice?.amount) {
      form.setValue("amount", invoice.amount);
    }
  }, [invoice?.amount, form]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      await createPayment({
        invoiceId: id,
        amount: data.amount,
        paidAt: data.paidAt,
        direction: data.direction,
        method: data.method,
      });

      toast.success("入金が正常に登録されました！");
      router.push(`/invoices/${id}`);
    } catch (error) {
      console.error("Failed to create payment:", error);
      toast.error("入金登録に失敗しました。再度お試しください。");
    }
  };

  if (fetchingInvoice) {
    return (
      <div className="text-center">請求書情報を読み込み中...</div>
    );
  }

  if (invoiceError) {
    return (
      <div className="text-center text-red-500">
        請求書の読み込みエラー: {invoiceError.message}
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center">請求書が見つかりません。</div>
    );
  }

  return (
    <div>
      <PageHeader
        title="入金記録"
        description={`請求書 #${invoice.invoiceNo || invoice.id} の入金を記録`}
        actions={
          <Link href={`/invoices/${id}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              請求書に戻る
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle>請求書詳細</CardTitle>
            <CardDescription>支払い対象の請求書情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <div><strong>請求書番号:</strong> {invoice.invoiceNo || invoice.id}</div>
              <div><strong>取引先:</strong> {invoice.partnerName}</div>
              <div><strong>件名・摘要:</strong> {invoice.description}</div>
              <div><strong>金額:</strong> ¥{invoice.amount?.toLocaleString()}</div>
              <div><strong>ステータス:</strong> {invoice.status}</div>
              <div><strong>発行日:</strong> {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : ''}</div>
              <div><strong>支払期限:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}</div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              支払情報
            </CardTitle>
            <CardDescription>支払内容を入力してください</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>支払金額</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        支払額（部分支払も可能）
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paidAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>支払日</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        支払を行った日付
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="direction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>入出金区分</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="区分を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IN">入金</SelectItem>
                          <SelectItem value="OUT">出金</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        請求書の場合は通常「入金」を選択します
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>支払方法</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="支払方法を選択" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BANK">銀行振込</SelectItem>
                          <SelectItem value="CASH">現金</SelectItem>
                          <SelectItem value="OTHER">その他</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        支払を行った方法
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "登録中..." : "支払を登録"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/invoices/${id}`)}
                  >
                    キャンセル
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}