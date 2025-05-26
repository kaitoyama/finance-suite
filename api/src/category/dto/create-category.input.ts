import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength } from 'class-validator';

@InputType()
export class CreateCategoryInput {
  @Field()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @Field({ nullable: true })
  @MaxLength(200)
  description?: string;
}