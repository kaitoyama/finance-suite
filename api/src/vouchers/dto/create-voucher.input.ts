import { InputType, Int, Field } from '@nestjs/graphql';

@InputType()
export class CreateVoucherInput {
  @Field(() => Int, { description: 'Example field (placeholder)' })
  exampleField: number;
}
