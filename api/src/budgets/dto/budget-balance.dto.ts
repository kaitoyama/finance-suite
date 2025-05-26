import { ObjectType, Field, Int, Float } from '@nestjs/graphql';

@ObjectType()
export class BudgetBalance {
  @Field(() => Int)
  categoryId: number;

  @Field()
  categoryName: string;

  @Field({ nullable: true })
  categoryDescription?: string;

  @Field(() => Float)
  planned: number;

  @Field(() => Float)
  actual: number;

  @Field(() => Float)
  remaining: number;

  @Field(() => Float, { description: 'Consumption ratio 0.00–1.00' })
  ratio: number;
}
