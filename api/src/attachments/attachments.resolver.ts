import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { Attachment } from 'src/attachments/entities/attachment.entity';
import { CreateAttachmentInput } from 'src/attachments/dto/create-attachment.input';
import { AttachmentsService } from 'src/attachments/attachments.service';
import { PresignedPayload } from 'src/attachments/dto/presigned-payload.dto';
import { UserHeader } from 'src/common/decorators/user-header.decorator';

// attachments/attachments.resolver.ts
@Resolver(() => Attachment)
export class AttachmentsResolver {
  constructor(private readonly svc: AttachmentsService) {}

  @Query(() => PresignedPayload, { name: 'getPresignedS3Url' })
  getPresignedS3Url(
    @Args('title') title: string,
    @UserHeader() user: { username: string },
  ) {
    return this.svc.getPresignedS3Url(title, user.username);
  }

  @Mutation(() => PresignedPayload, { name: 'createPresignedPost' })
  createPresignedPost(@Args('filename') filename: string) {
    return this.svc.createPresignedPost(filename);
  }

  @Mutation(() => Attachment)
  createAttachment(
    @Args('input') input: CreateAttachmentInput,
    @UserHeader() user: { username: string },
  ) {
    return this.svc.createAttachment(input, user.username);
  }
}
