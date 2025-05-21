
import { Field, ObjectType } from '@nestjs/graphql';

// attachments/dto/presigned-payload.dto.ts
@ObjectType()
export class PresignedPayloadField {
  @Field() key!: string;
  @Field() value!: string;
}

@ObjectType()
export class PresignedPayload {
  @Field() url!: string;
  @Field(() => [PresignedPayloadField]) fields!: PresignedPayloadField[];
  @Field() objectKey!: string;
}
