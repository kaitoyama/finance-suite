import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Decimal } from '@prisma/client/runtime/library';

@ObjectType()
export class BudgetDto {
  @Field(() => Int)
  id: number;

  @Field(() => Int)
  categoryId: number;

  @Field(() => Int)
  fiscalYear: number;

  @Field(() => Float)
  amountPlanned: Decimal;

  @Field()
  createdAt: Date;
}
