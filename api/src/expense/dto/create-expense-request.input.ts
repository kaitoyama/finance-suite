import { InputType, Field, Int, Float } from '@nestjs/graphql';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class CreateExpenseRequestInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0.01) // Assuming amount must be positive
  amount: number;

  @Field(() => [Int])
  @IsInt({ each: true })
  @IsNotEmpty({ each: true })
  attachmentIds: number[];

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  accountId?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  description?: string;
}
