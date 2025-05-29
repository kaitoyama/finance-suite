import { Module } from '@nestjs/common';
import { ProfitLossService } from './profit-loss.service';
import { ProfitLossResolver } from './profit-loss.resolver';
import { PrismaModule } from '../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ProfitLossService, ProfitLossResolver],
  exports: [ProfitLossService],
})
export class ProfitLossModule {}
