// src/attachments/dto/attachment.dto.ts
import { Field, Float, Int } from '@nestjs/graphql';

export class Attachment {
  @Field(() => Int)
  id!: number;

  @Field()
  s3Key!: string;

  @Field()
  title!: string;

  @Field(() => Float)
  amount!: number;

  @Field()
  createdAt!: Date;
}
