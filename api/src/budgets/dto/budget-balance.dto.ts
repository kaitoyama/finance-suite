import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class BudgetBalance {
  @Field(() => Int)
  accountId: number;

  @Field()
  accountCode: string;

  @Field()
  accountName: string;

  @Field(() => Float)
  planned: number;

  @Field(() => Float)
  actual: number;

  @Field(() => Float)
  remaining: number;

  @Field(() => Float, { description: 'Consumption ratio 0.00–1.00' })
  ratio: number;
} 