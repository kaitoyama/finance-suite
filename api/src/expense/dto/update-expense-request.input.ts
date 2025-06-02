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
export class UpdateExpenseRequestInput {
  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  id: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  amount?: number;

  @Field(() => Int, { nullable: true })
  @IsInt()
  @IsOptional()
  attachmentId?: number;

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
