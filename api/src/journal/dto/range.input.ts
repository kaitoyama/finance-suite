import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsString, IsDate } from 'class-validator';

@InputType()
export class RangeInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  searchTerm?: string;
}
