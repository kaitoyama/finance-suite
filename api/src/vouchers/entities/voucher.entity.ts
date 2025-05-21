import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Voucher {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
