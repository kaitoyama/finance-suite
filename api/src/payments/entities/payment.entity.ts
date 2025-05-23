import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import {
  PaymentLabel as PaymentLabelEnum,
  PaymentDirection,
  PaymentMethod,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { Attachment } from '../../attachments/entities/attachment.entity';

registerEnumType(PaymentLabelEnum, {
  name: 'PaymentLabel',
});

registerEnumType(PaymentDirection, {
  name: 'PaymentDirection',
});

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
});

@ObjectType()
export class Payment {
  @Field(() => Int)
  id: number;

  @Field()
  paidAt: Date;

  @Field(() => Number)
  amount: Decimal;

  @Field(() => PaymentLabelEnum)
  label: PaymentLabelEnum;

  @Field(() => PaymentDirection)
  direction: PaymentDirection;

  @Field(() => PaymentMethod)
  method: PaymentMethod;

  @Field(() => Invoice, { nullable: true })
  invoice?: Invoice;

  @Field(() => Int, { nullable: true })
  invoiceId?: number;

  @Field(() => Number, { nullable: true })
  overpaidAmount?: Decimal;

  @Field(() => Int, { nullable: true })
  expenseRequestId?: number;

  @Field(() => [Attachment], { nullable: 'itemsAndList' })
  attachments?: Attachment[];

  @Field({ nullable: true })
  createdAt?: Date;

  @Field({ nullable: true })
  updatedAt?: Date;
}
