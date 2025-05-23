import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BudgetsService } from './budgets.service';
import { BudgetBalance } from './dto/budget-balance.dto';
import { BudgetDto } from './dto/budget.dto';
import { BudgetInput } from './dto/budget.input';
import { Budget } from '@prisma/client';

@Resolver(() => BudgetDto)
export class BudgetsResolver {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Mutation(() => BudgetDto)
  async setBudget(@Args('input') input: BudgetInput): Promise<Budget> {
    return this.budgetsService.setBudget(input);
  }

  @Query(() => [BudgetDto], { name: 'listBudgetsByYear' })
  async listBudgetsByYear(
    @Args('fiscalYear', { type: () => Int }) fiscalYear: number,
  ): Promise<Budget[]> {
    return this.budgetsService.listBudgetsByYear(fiscalYear);
  }

  @Query(() => [BudgetBalance], { name: 'budgets' })
  async getBudgetBalancesResolver(
    @Args('year', { type: () => Int }) year: number,
  ): Promise<BudgetBalance[]> {
    return this.budgetsService.getBudgetBalances(year);
  }
}
