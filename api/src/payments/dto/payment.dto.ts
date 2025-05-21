import { ObjectType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { PaymentLabel as PaymentLabelEnum } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Invoice } from '../../invoice/entities/invoice.entity';

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

  @Field(() => Invoice, { nullable: true })
  invoice?: Invoice;

  @Field(() => Int, { nullable: true })
  invoiceId?: number;
} 