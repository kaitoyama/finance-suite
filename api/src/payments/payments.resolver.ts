import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { CreatePaymentInput } from './dto/create-payment.input';
import { UpdatePaymentInput } from './dto/update-payment.input';
import { UserHeader } from '../common/decorators/user-header.decorator';
import { Payment as PaymentModel } from '@prisma/client';
@Resolver(() => Payment)
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => Payment)
  async createPayment(
    @Args('createPaymentInput') createPaymentInput: CreatePaymentInput,
    @UserHeader() user: { username: string; isAdmin: boolean },
  ): Promise<PaymentModel> {
    // Get user ID from username (create if doesn't exist)
    const userRecord = await this.paymentsService.getUserByUsername(
      user.username,
      user.isAdmin,
    );
    return this.paymentsService.createPayment(
      createPaymentInput,
      userRecord.id,
    );
  }

  @Query(() => [Payment], { name: 'payments' })
  findAll() {
    return this.paymentsService.findAll();
  }

  @Query(() => Payment, { name: 'payment', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.paymentsService.findOne(id);
  }

  @Mutation(() => Payment)
  updatePayment(
    @Args('id', { type: () => Int }) id: number,
    @Args('updatePaymentInput') updatePaymentInput: UpdatePaymentInput,
  ): Promise<PaymentModel> {
    return this.paymentsService.updatePayment(id, updatePaymentInput);
  }

  @Mutation(() => Payment)
  removePayment(@Args('id', { type: () => Int }) id: number): Promise<PaymentModel> {
    return this.paymentsService.remove(id);
  }
}
