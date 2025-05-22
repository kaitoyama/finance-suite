"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCreateInvoice } from "@/hooks/useInvoice";
// Assuming you have a toast component, replace with your actual import
// import { toast } from "@/components/ui/use-toast"; // Or your toast library

// Define the Zod schema for validation (Task 4)
const formSchema = z.object({
  partnerName: z.string().min(1, "取引先名は必須です"),
  description: z.string().min(1, "件名/摘要は必須です"),
  amount: z.coerce.number().positive("金額は0より大きい値を入力してください"),
  issueDate: z.date({
    required_error: "発行日は必須です",
  }),
});

type InvoiceFormValues = z.infer<typeof formSchema>;

export default function CreateInvoicePage() {
  const router = useRouter();
  const { createInvoice, fetching, error } = useCreateInvoice();

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      partnerName: "",
      description: "",
      amount: 0,
      issueDate: new Date(),
    },
  });

  async function onSubmit(values: InvoiceFormValues) {
    try {
      const result = await createInvoice({
        partnerName: values.partnerName,
        description: values.description,
        amount: values.amount,
        dueDate: values.issueDate.toISOString(),
      });

      if (result && result.id) {
        // Assuming toast is available
        // toast({ title: "請求書が作成されました。" });
        console.log("Invoice created:", result);
        router.push(`/invoices/${result.id}`);
      } else if (error) {
        console.error("Invoice creation error:", error);
        // toast({
        //   title: "エラー",
        //   description: "請求書の作成に失敗しました。",
        //   variant: "destructive",
        // });
      } else {
        // Handle case where result is undefined but no explicit error from hook
         console.error("Invoice creation failed: No result returned");
        // toast({
        //   title: "エラー",
        //   description: "請求書の作成に予期せぬ問題が発生しました。",
        //   variant: "destructive",
        // });
      }
    } catch (e) {
      console.error("Submission error:", e);
      // toast({
      //   title: "エラー",
      //   description: "フォームの送信中にエラーが発生しました。",
      //   variant: "destructive",
      // });
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">請求書発行</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="partnerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="partnerName">取引先名</FormLabel>
                <FormControl>
                  <Input id="partnerName" placeholder="株式会社 Example" {...field} aria-label="取引先名" />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="description">件名・摘要</FormLabel>
                <FormControl>
                  <Input id="description" placeholder="プロジェクトX請求" {...field} aria-label="件名・摘要" />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="amount">金額 (円)</FormLabel>
                <FormControl>
                  <Input id="amount" type="number" placeholder="10000" {...field} aria-label="金額" />
                </FormControl>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel htmlFor="issueDate">発行日</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        id="issueDate"
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                        aria-label="発行日"
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>日付を選択</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage role="alert" />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={fetching}>
            {fetching ? "作成中..." : "請求書を作成"}
          </Button>
        </form>
      </Form>
      {/* Basic error display, can be improved with toast notifications */}
      {error && (
        <p className="mt-4 text-red-500" role="alert">
          エラー: {error.message}
        </p>
      )}
    </div>
  );
} 