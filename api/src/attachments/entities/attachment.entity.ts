import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity'; // Assuming User entity path

@ObjectType()
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

  // Relation to uploader
  @Field(() => User)
  uploader!: User;

  // Foreign key for uploader
  @Field(() => Int)
  uploaderId!: number;
}
