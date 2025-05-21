// src/attachments/dto/create-attachment.input.ts
import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()  // GraphQL の InputType を宣言するデコレータ:contentReference[oaicite:0]{index=0}
export class CreateAttachmentInput {
  @Field()                             // 標準の文字列フィールド:contentReference[oaicite:1]{index=1}
  s3Key!: string;

  @Field()                             // ファイル名などのタイトル用フィールド:contentReference[oaicite:2]{index=2}
  title!: string;

  @Field(() => Float)                  // 数値を扱う場合は Float や Int 指定が必要:contentReference[oaicite:3]{index=3}
  amount!: number;
}
