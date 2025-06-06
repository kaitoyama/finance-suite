import {
  ObjectType,
  Field,
  Int,
  Float,
  registerEnumType,
} from '@nestjs/graphql';
import { InvoiceStatus as PrismaInvoiceStatus } from '@prisma/client';

// Register the enum with GraphQL
registerEnumType(PrismaInvoiceStatus, {
  name: 'InvoiceStatus',
});

@ObjectType()
export class Invoice {
  @Field(() => Int)
  id: number;

  @Field()
  invoiceNo: string;

  @Field()
  partnerName: string;

  @Field(() => Float)
  amount: number;

  @Field(() => PrismaInvoiceStatus)
  status: PrismaInvoiceStatus;

  @Field()
  pdfKey: string;

  @Field(() => Date) // Assuming Date scalar is configured globally for GraphQL
  createdAt: Date;

  @Field(() => Date)
  issueDate: Date;

  @Field(() => Date) // Assuming Date scalar is configured globally for GraphQL
  dueDate: Date;

  @Field({ nullable: true })
  description?: string;

  // Note: createdById and createdBy (relation) are not exposed in GraphQL as per the issue spec,
  // but can be added if needed.
}
