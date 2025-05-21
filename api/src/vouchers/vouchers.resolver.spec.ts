import { Test, TestingModule } from '@nestjs/testing';
import { VouchersResolver } from './vouchers.resolver';
import { VouchersService } from './vouchers.service';

describe('VouchersResolver', () => {
  let resolver: VouchersResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VouchersResolver, VouchersService],
    }).compile();

    resolver = module.get<VouchersResolver>(VouchersResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
