import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  PaymentLabel as PaymentLabelEnum,
  PaymentDirection as PaymentDirectionEnum,
  PaymentMethod as PaymentMethodEnum,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Invoice } from '../../invoice/entities/invoice.entity';
// import { ExpenseRequest } from '../../expense-request/entities/expense-request.entity'; // Assuming this path, will be created later
// import { PaymentAttachmentDto } from './payment-attachment.dto'; // Assuming this DTO

@ObjectType()
export class PaymentDto {
  @Field(() => Int)
  id: number;

  @Field()
  paidAt: Date;

  @Field(() => Number)
  amount: Decimal;

  @Field(() => PaymentLabelEnum)
  label: PaymentLabelEnum;

  // --- New fields ---
  @Field(() => PaymentDirectionEnum)
  direction: PaymentDirectionEnum;

  @Field(() => PaymentMethodEnum)
  method: PaymentMethodEnum;

  // @Field(() => ExpenseRequest, { nullable: true }) // Uncomment when ExpenseRequest is available
  // expenseRequest?: ExpenseRequest;

  @Field(() => Int, { nullable: true })
  expenseRequestId?: number;

  // @Field(() => [PaymentAttachmentDto], { nullable: 'itemsAndList' }) // Uncomment when PaymentAttachmentDto is available
  // attachments?: PaymentAttachmentDto[];
  // --- End new fields ---

  @Field(() => Invoice, { nullable: true })
  invoice?: Invoice;

  @Field(() => Int, { nullable: true })
  invoiceId?: number;
}
