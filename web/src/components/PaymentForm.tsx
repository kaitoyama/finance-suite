'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
// Assume AttachmentUploader exists and can handle multiple files.
// import AttachmentUploader from './AttachmentUploader'; // Path might need adjustment

// Define PaymentMethod enum as per schema (assuming it's defined elsewhere or we define it here)
export enum PaymentMethod {
  BANK = 'BANK',
  CASH = 'CASH',
  OTHER = 'OTHER',
}

const paymentFormSchema = z.object({
  paidAt: z.date({
    required_error: '支払日は必須です。',
  }).refine(date => date <= new Date(), {
    message: '未来の日付は選択できません。',
  }),
  amount: z.coerce.number({
    required_error: '金額は必須です。',
    invalid_type_error: '金額は数値で入力してください。',
  }).positive({ message: '金額は0より大きい値を入力してください。' }),
  method: z.nativeEnum(PaymentMethod, {
    required_error: '支払方法は必須です。',
  }),
  // attachments: z.array(z.instanceof(File)).min(1, { message: '証憑ファイルを1つ以上添付してください。' }),
  // For now, let's use a placeholder for attachments until AttachmentUploader integration
  attachments: z.any().refine(val => val && val.length > 0, { message: '証憑ファイルを1つ以上添付してください。'}),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  expenseAmount: number; // Needed for label calculation and display
  expenseId: string; // Assuming ID is a string, adjust if number
  onSubmit: (values: PaymentFormValues, label: 'PARTIAL' | 'OVERPAY' | null) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PaymentForm({
  expenseAmount,
  // expenseId, // Not directly used in the form component itself, but will be used by the page calling onSubmit
  onSubmit,
  onCancel,
  isLoading,
}: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      paidAt: new Date(),
      amount: expenseAmount, // Pre-fill with expense amount
      method: PaymentMethod.BANK,
      attachments: [],
    },
  });

  // const { calcPaymentLabel } = usePaymentLabel(); // Placeholder for hook or direct import

  const handleSubmit = async (values: PaymentFormValues) => {
    // const label = calcPaymentLabel(values.amount, expenseAmount);
    // For now, label calculation will be done in the page component before calling the mutation
    // This form only collects data
    await onSubmit(values, null); // Pass null for label for now
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="paidAt"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>支払日</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-[240px] pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'yyyy-MM-dd')
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
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>金額</FormLabel>
              <FormControl>
                <Input type="number" placeholder="50000" {...field} onChange={event => field.onChange(+event.target.value)}/>
              </FormControl>
              <FormDescription>
                経費申請額: {expenseAmount.toLocaleString()} 円
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
                  <SelectItem value={PaymentMethod.BANK}>銀行振込</SelectItem>
                  <SelectItem value={PaymentMethod.CASH}>現金</SelectItem>
                  <SelectItem value={PaymentMethod.OTHER}>その他</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="attachments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>証憑ファイル</FormLabel>
              <FormControl>
                {/* Placeholder for AttachmentUploader */}
                <Input 
                  type="file" 
                  multiple 
                  onChange={(e) => field.onChange(e.target.files ? Array.from(e.target.files) : [])} 
                  // Pass inputRef to field.ref if needed by react-hook-form for file inputs
                />
              </FormControl>
              <FormDescription>
                振込控えや領収書PDFなどを添付してください。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            キャンセル
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '処理中...' : '支払を登録'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 