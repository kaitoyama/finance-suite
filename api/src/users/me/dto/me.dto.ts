import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType() // ← GraphQL type を自動生成
export class MeDto {
  @Field() username: string; // scalar は decorator 1 行で SDL に反映
  @Field() isAdmin: boolean;
}
