import { InputType, Field } from '@nestjs/graphql';
import { JournalLineInput } from './journal-line.input';
import { IsOptional, IsString, IsArray, ValidateNested, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

@InputType()
export class CreateJournalEntryInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  datetime?: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [JournalLineInput])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JournalLineInput)
  lines: JournalLineInput[];
}
