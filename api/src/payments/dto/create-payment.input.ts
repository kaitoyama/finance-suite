import { Field, InputType, Int, registerEnumType } from '@nestjs/graphql';
import {
  PaymentDirection as PaymentDirectionEnum,
  PaymentMethod as PaymentMethodEnum,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';

// Register enums with GraphQL directly in this file
registerEnumType(PaymentDirectionEnum, {
  name: 'PaymentDirection',
  description: 'Direction of the payment (IN/OUT)',
});

registerEnumType(PaymentMethodEnum, {
  name: 'PaymentMethod',
  description: 'Method of the payment (BANK/CASH/OTHER)',
});

@InputType()
export class CreatePaymentInput {
  @Field(() => Int, {
    nullable: true,
    description: 'ID of the invoice to associate this payment with',
  })
  @IsOptional()
  @IsInt()
  invoiceId?: number;

  @Field({ description: 'Date when the payment was made' })
  @IsNotEmpty()
  @IsDate()
  paidAt: Date;

  @Field(() => Number, { description: 'Amount of the payment' })
  @IsNotEmpty()
  @IsNumber()
  //Resolved in service to Decimal
  amount: number; // Keep as number for GraphQL input, convert to Decimal in service

  // --- New fields ---
  @Field(() => PaymentDirectionEnum, {
    description: 'Direction of the payment (IN/OUT)',
  })
  @IsNotEmpty()
  @IsEnum(PaymentDirectionEnum)
  direction: PaymentDirectionEnum;

  @Field(() => PaymentMethodEnum, {
    description: 'Method of the payment (BANK/CASH/OTHER)',
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethodEnum)
  method: PaymentMethodEnum;

  @Field(() => Int, {
    nullable: true,
    description: 'ID of the expense request to associate this payment with',
  })
  @IsOptional()
  @IsInt()
  expenseRequestId?: number;

  @Field(() => [Int], {
    nullable: 'itemsAndList',
    description: 'IDs of attachments to link to this payment',
  })
  @IsOptional()
  @IsInt({ each: true })
  attachmentIds?: number[];
  // --- End new fields ---
}
