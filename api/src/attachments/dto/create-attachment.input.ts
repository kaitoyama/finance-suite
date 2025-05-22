// src/attachments/dto/create-attachment.input.ts
import { InputType, Field, Float } from '@nestjs/graphql';
import { IsString, IsNumber, IsPositive } from 'class-validator';

@InputType()
export class CreateAttachmentInput {
  @Field()
  @IsString()
  s3Key!: string;

  @Field()
  @IsString()
  title!: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  amount!: number;
}
