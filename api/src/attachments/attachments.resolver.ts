import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { PresignedPayload } from './dto/presigned-payload.dto';
import { Attachment } from './dto/attachment.dto';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { AttachmentsService } from './attachments.service';
import { Request } from 'express';

// attachments/attachments.resolver.ts
@Resolver(() => Attachment)
export class AttachmentsResolver {
  constructor(private readonly svc: AttachmentsService) {}

  @Mutation(() => PresignedPayload)
  createPresignedPost(@Args('filename') filename: string) {
    return this.svc.createPresignedPost(filename);
  }

  @Mutation(() => Attachment)
  createAttachment(
    @Args('input') input: CreateAttachmentInput,
    @Context('req') req: Request
  ) {
    return this.svc.createAttachment(
      input,
      req.username!,
    );
  }
}