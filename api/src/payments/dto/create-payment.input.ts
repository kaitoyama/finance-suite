import { Field, InputType, Int } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime/library';
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreatePaymentInput {
  @Field(() => Int, { nullable: true, description: 'ID of the invoice to associate this payment with' })
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
} 