import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { BudgetsService } from './budget.service';
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

  @Query(() => [BudgetDto], { name: 'budgets' })
  async budgets(@Args('fiscalYear', { type: () => Int }) fiscalYear: number): Promise<Budget[]> {
    return this.budgetsService.budgets(fiscalYear);
  }
} 