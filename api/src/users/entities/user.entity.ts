import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  username: string; // Assuming username from Prisma schema

  @Field(() => Boolean, { defaultValue: false })
  isAdmin: boolean;
}
