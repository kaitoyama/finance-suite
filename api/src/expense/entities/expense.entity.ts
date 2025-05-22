import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { Attachment } from '../../attachments/entities/attachment.entity';
import { User } from '../../users/entities/user.entity';
import { Payment } from '../../payments/entities/payment.entity';

export enum RequestState {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

registerEnumType(RequestState, {
  name: 'RequestState',
});

@ObjectType()
export class ExpenseRequest {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  amount: number;

  @Field(() => RequestState)
  state: RequestState;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  approvedAt?: Date;

  @Field(() => User)
  requester: User;

  @Field(() => User, { nullable: true })
  approver?: User;

  @Field(() => Payment, { nullable: true })
  payment?: Payment;

  @Field(() => Attachment)
  attachment: Attachment;
}
