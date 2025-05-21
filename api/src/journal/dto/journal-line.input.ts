import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional, ValidateIf } from 'class-validator';

@InputType()
export class JournalLineInput {
  @Field(() => Int)
  @IsInt()
  accountId: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @ValidateIf(o => o.credit == null) // debit must exist if credit doesn't
  debit?: number;

  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @ValidateIf(o => o.debit == null) // credit must exist if debit doesn't
  credit?: number;
}
