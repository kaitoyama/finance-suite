import { CreateVoucherInput } from './create-voucher.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateVoucherInput extends PartialType(CreateVoucherInput) {
  @Field(() => Int)
  id: number;
}
