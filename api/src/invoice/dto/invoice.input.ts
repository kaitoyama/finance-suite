import { InputType, Field, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsNumber, IsPositive, IsDateString, IsOptional } from 'class-validator';

@InputType()
export class InvoiceInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  partnerName: string;

  @Field(() => Float)
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  amount: number;

  @Field()
  @IsNotEmpty()
  @IsDateString()
  dueDate: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
} 