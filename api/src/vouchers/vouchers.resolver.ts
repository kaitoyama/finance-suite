import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { VouchersService } from './vouchers.service';
import { Voucher } from './entities/voucher.entity';
import { CreateVoucherInput } from './dto/create-voucher.input';
import { UpdateVoucherInput } from './dto/update-voucher.input';

@Resolver(() => Voucher)
export class VouchersResolver {
  constructor(private readonly vouchersService: VouchersService) {}

  @Mutation(() => Voucher)
  createVoucher(@Args('createVoucherInput') createVoucherInput: CreateVoucherInput) {
    return this.vouchersService.create(createVoucherInput);
  }

  @Query(() => [Voucher], { name: 'vouchers' })
  findAll() {
    return this.vouchersService.findAll();
  }

  @Query(() => Voucher, { name: 'voucher' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.vouchersService.findOne(id);
  }

  @Mutation(() => Voucher)
  updateVoucher(@Args('updateVoucherInput') updateVoucherInput: UpdateVoucherInput) {
    return this.vouchersService.update(updateVoucherInput.id, updateVoucherInput);
  }

  @Mutation(() => Voucher)
  removeVoucher(@Args('id', { type: () => Int }) id: number) {
    return this.vouchersService.remove(id);
  }
}
