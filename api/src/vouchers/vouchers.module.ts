import { Module } from '@nestjs/common';
import { VouchersService } from './vouchers.service';
import { VouchersResolver } from './vouchers.resolver';

@Module({
  providers: [VouchersResolver, VouchersService],
})
export class VouchersModule {}
