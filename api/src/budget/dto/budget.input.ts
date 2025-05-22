import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsInt, Min, IsNotEmpty } from 'class-validator';
import { Decimal } from '@prisma/client/runtime/library';

@InputType()
export class BudgetInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  accountId: number;

  @Field(() => Int)
  @IsInt()
  @Min(2000) // As per AC4: fiscalYear < 2000 should be a validation error
  @IsNotEmpty()
  fiscalYear: number;

  @Field(() => Float)
  @Min(0) // As per AC1 & AC4: amountPlanned >= 0
  @IsNotEmpty()
  amountPlanned: Decimal;
} 