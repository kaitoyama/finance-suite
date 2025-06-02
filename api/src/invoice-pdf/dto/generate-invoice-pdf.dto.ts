import { Field, InputType, ObjectType, Float } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

@InputType()
export class GenerateInvoicePdfInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  invoiceNo: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  partnerName: string;

  @Field(() => Float) // GraphQL Float maps to number in TypeScript
  @IsNumber()
  amount: number;

  @Field(() => String) // Using String for date to match GraphQL spec and simplify input
  @IsDateString()
  date: string; // Expecting YYYY-MM-DD format

  // Optional fields from the image, can be overridden if needed
  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  subjectText?: string; // e.g., "CPCTF 2025 協賛費"

  @Field(() => String)
  @IsDateString()
  @IsNotEmpty()
  dueDateText: string; // e.g., "2025/6/30"

  @Field(() => String, { nullable: true })
  @IsString()
  @IsNotEmpty()
  itemDescriptionText?: string; // e.g., "CPCTF 2025 協賛費"
}

@ObjectType()
export class GenerateInvoicePdfPayload {
  @Field(() => String)
  pdfKey: string;

  @Field(() => String)
  presignedUrl: string;
}
