import { InputType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';

@InputType()
export class MarkExpensePaidInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  expenseRequestId: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  paymentId: number;
} 