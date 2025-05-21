import { Injectable } from '@nestjs/common';
import { CreateVoucherInput } from './dto/create-voucher.input';
import { UpdateVoucherInput } from './dto/update-voucher.input';

@Injectable()
export class VouchersService {
  create(createVoucherInput: CreateVoucherInput) {
    return 'This action adds a new voucher';
  }

  findAll() {
    return `This action returns all vouchers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} voucher`;
  }

  update(id: number, updateVoucherInput: UpdateVoucherInput) {
    return `This action updates a #${id} voucher`;
  }

  remove(id: number) {
    return `This action removes a #${id} voucher`;
  }
}
