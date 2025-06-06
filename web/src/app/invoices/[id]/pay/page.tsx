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
      
      toast.success("Payment recorded successfully!");
      router.push(`/invoices/${id}`);
    } catch (error) {
      console.error("Failed to create payment:", error);
      toast.error("Failed to record payment. Please try again.");
    }
  };

  if (fetchingInvoice) {
    return (
      <div className="text-center">Loading invoice information...</div>
    );
  }

  if (invoiceError) {
    return (
      <div className="text-center text-red-500">
        Error loading invoice: {invoiceError.message}
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center">Invoice not found.</div>
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
            <CardTitle>Invoice Details</CardTitle>
            <CardDescription>Information about the invoice being paid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <div><strong>Invoice Number:</strong> {invoice.invoiceNo || invoice.id}</div>
              <div><strong>Partner:</strong> {invoice.partnerName}</div>
              <div><strong>Description:</strong> {invoice.description}</div>
              <div><strong>Amount:</strong> ¥{invoice.amount?.toLocaleString()}</div>
              <div><strong>Status:</strong> {invoice.status}</div>
              <div><strong>Issue Date:</strong> {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : ''}</div>
              <div><strong>Due Date:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}</div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Payment Information
            </CardTitle>
            <CardDescription>Enter the payment details</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Amount</FormLabel>
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
                        Amount being paid (can be partial or full payment)
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
                      <FormLabel>Payment Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        The date when the payment was made
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
                      <FormLabel>Payment Direction</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment direction" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="IN">Incoming (Received)</SelectItem>
                          <SelectItem value="OUT">Outgoing (Paid)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        For invoices, this is typically &ldquo;Incoming&rdquo;
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
                      <FormLabel>Payment Method</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BANK">Bank Transfer</SelectItem>
                          <SelectItem value="CASH">Cash</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How the payment was made
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Recording..." : "Record Payment"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/invoices/${id}`)}
                  >
                    Cancel
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