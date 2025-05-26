import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, Min, Max } from 'class-validator';

@InputType()
export class PaginationInput {
  @Field(() => Int, { nullable: true, defaultValue: 1 })
  @IsOptional()
  @Min(1)
  page?: number = 1;

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  @IsOptional()
  @Min(1)
  @Max(100) // Prevent excessive queries
  limit?: number = 20;
}