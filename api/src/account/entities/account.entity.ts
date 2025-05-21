import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { AccountCategory } from '@prisma/client'; // Assuming AccountCategory enum is in prisma client

registerEnumType(AccountCategory, {
  name: 'AccountCategory',
});

@ObjectType()
export class Account {
  @Field(() => ID)
  id: number;

  @Field()
  code: string;

  @Field()
  name: string;

  @Field(() => AccountCategory)
  category: AccountCategory;
}
