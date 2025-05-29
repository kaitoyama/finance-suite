import { ObjectType, Field, Float } from '@nestjs/graphql';

@ObjectType()
export class AccountSummary {
  @Field()
  accountId: number;

  @Field()
  accountCode: string;

  @Field()
  accountName: string;

  @Field(() => Float)
  balance: number;
}

@ObjectType()
export class ProfitLossStatement {
  @Field()
  fiscalYear: number;

  @Field()
  startDate: string;

  @Field()
  endDate: string;

  @Field(() => [AccountSummary])
  revenues: AccountSummary[];

  @Field(() => [AccountSummary])
  expenses: AccountSummary[];

  @Field(() => Float)
  totalRevenue: number;

  @Field(() => Float)
  totalExpense: number;

  @Field(() => Float)
  netIncome: number;
}
