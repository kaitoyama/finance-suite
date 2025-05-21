import { Field, InputType, Int, PartialType } from '@nestjs/graphql';
import { Payment } from '../entities/payment.entity';
import { Decimal } from '@prisma/client/runtime/library';
import { IsDate, IsInt, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

@InputType()
export class CreatePaymentInput extends PartialType(
  Payment,
  InputType,
) {
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  invoiceId?: number;

  @Field()
  @IsNotEmpty()
  @IsDate()
  paidAt: Date;

  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  amount: Decimal;
} 