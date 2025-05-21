import { InputType, Field } from '@nestjs/graphql';
import { AccountCategory } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

@InputType()
export class CreateAccountInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  code: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field(() => AccountCategory)
  @IsEnum(AccountCategory)
  @IsNotEmpty()
  category: AccountCategory;
} 