import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import { Account } from '../../account/entities/account.entity'; // Correct import for Account

@ObjectType()
export class JournalLine {
  @Field(() => ID) // Assuming 'id' should be an ID type for JournalLine as well
  id: number;

  @Field(() => Int)
  accountId: number;

  @Field(() => Account, { nullable: true }) // Use imported Account
  account?: Account;

  @Field(() => Float, { nullable: true })
  debit?: number;

  @Field(() => Float, { nullable: true })
  credit?: number;
}
