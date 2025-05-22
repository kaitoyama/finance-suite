import { ObjectType, Field, Int, Float, registerEnumType } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity'; // Assuming User entity path
import { Attachment } from '../../attachments/entities/attachment.entity'; // Path to the new Attachment entity
import { Payment } from '../../payments/entities/payment.entity'; // Assuming Payment entity path
import { RequestState } from '@prisma/client'; // Import the enum from Prisma client

// Register the Prisma enum with GraphQL
registerEnumType(RequestState, {
  name: 'RequestState',
  description: 'The state of an expense request',
});

@ObjectType()
export class ExpenseRequest {
  @Field(() => Int)
  id: number;

  @Field(() => Float)
  amount: number; // Prisma Decimal will be converted to float

  @Field(() => RequestState)
  state: RequestState;

  @Field()
  createdAt: Date;

  @Field({ nullable: true })
  approvedAt?: Date;

  // Relations
  @Field(() => Attachment)
  attachment: Attachment; // Temporarily commented out

  @Field(() => User)
  requester: User;
  // requesterId is implicitly available via requester.id

  @Field(() => User, { nullable: true })
  approver?: User;
  // approverId is implicitly available via approver.id

  @Field(() => Payment, { nullable: true })
  payment?: Payment;
  // paymentId is implicitly available via payment.id
} 