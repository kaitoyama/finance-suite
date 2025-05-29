import { Injectable } from '@nestjs/common';
import { MinioService } from '../storage/minio.service';
import { PrismaService } from '../prisma.service';
import { CreateAttachmentInput } from './dto/create-attachment.input';
import { Attachment } from '@prisma/client';
// attachments/attachments.service.ts
@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async getPresignedS3Url(objectKey: string, username: string) {
    // Basic implementation, adapt as needed for actual S3 GET URL generation
    // This might involve calling a method on this.minio like generatePresignedGetUrl(objectKey)
    // Also, you might want to log access or check permissions based on the username.
    const url = await this.minio.generatePresignedGetUrl(objectKey);
    return { url, objectKey };
  }

  async createPresignedPost(filename: string) {
    const { postURL, formData } =
      await this.minio.generatePresignedPost(filename);

    // formData は { key: 'value' } オブジェクトなので整形
    const fields = Object.entries(formData).map(([key, value]) => ({
      key,
      value,
    }));
    return { url: postURL, fields, objectKey: filename };
  }

  async createAttachment(
    input: CreateAttachmentInput,
    username: string,
  ): Promise<Attachment> {
    let uploader = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!uploader) {
      // If user does not exist, create a new one
      uploader = await this.prisma.user.create({
        data: { username },
      });
    }
    return this.prisma.attachment.create({
      data: {
        s3Key: input.s3Key,
        title: input.title,
        amount: input.amount,
        uploader: { connect: { id: uploader.id } },
      },
    });
  }
}
