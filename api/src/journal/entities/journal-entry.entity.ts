import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity'; // Correct import for User
import { JournalLine } from './journal-line.entity';

@ObjectType()
export class JournalEntry {
  @Field(() => ID)
  id: number;

  @Field()
  datetime: Date;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  createdById: number;

  @Field(() => User, { nullable: true }) // Use imported User
  createdBy?: User;

  @Field(() => [JournalLine], { nullable: 'itemsAndList' })
  lines?: JournalLine[];
}
