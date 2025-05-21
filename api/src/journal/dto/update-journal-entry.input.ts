import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateJournalEntryInput } from './create-journal-entry.input';
import { IsInt } from 'class-validator';

@InputType()
export class UpdateJournalEntryInput extends PartialType(CreateJournalEntryInput) {
  @Field(() => ID)
  @IsInt()
  id: number;
}
