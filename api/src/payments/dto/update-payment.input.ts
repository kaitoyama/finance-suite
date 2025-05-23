import { InputType, PartialType } from '@nestjs/graphql';
import { CreatePaymentInput } from './create-payment.input';

@InputType()
export class UpdatePaymentInput extends PartialType(CreatePaymentInput) {}
