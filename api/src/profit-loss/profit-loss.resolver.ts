import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ProfitLossService } from './profit-loss.service';
import { ProfitLossStatement } from './dto/profit-loss.dto';

@Resolver(() => ProfitLossStatement)
export class ProfitLossResolver {
  constructor(private readonly profitLossService: ProfitLossService) {}

  @Query(() => ProfitLossStatement, { name: 'profitLossStatement' })
  async getProfitLossStatement(
    @Args('fiscalYear', { type: () => Int }) fiscalYear: number,
  ): Promise<ProfitLossStatement> {
    return this.profitLossService.generateProfitLossStatement(fiscalYear);
  }
}
