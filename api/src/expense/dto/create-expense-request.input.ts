import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsNumber, Min } from 'class-validator';

@InputType()
export class CreateExpenseRequestInput {
  @Field(() => Float)
  @IsNumber()
  @Min(0.01) // Assuming amount must be positive
  amount: number;

  @Field(() => Int)
  @IsInt()
  @IsNotEmpty()
  attachmentId: number;

  // requesterId will be taken from the authenticated user context in the resolver
  // No need to expose it in the GraphQL input

  // Optional: Add description if it's part of the model and desired in creation
  // @Field({ nullable: true })
  // @IsString()
  // @IsOptional()
  // description?: string;
} 