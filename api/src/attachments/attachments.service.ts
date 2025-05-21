import { Injectable } from '@nestjs/common';
import { MinioService } from '../storage/minio.service';
import { PrismaService } from '../prisma.service';
import { CreateAttachmentInput } from './dto/create-attachment.input';
// attachments/attachments.service.ts
@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async createPresignedPost(filename: string) {
    const objectKey = `${Date.now()}-${filename}`;
    const { postURL, formData } =
      await this.minio.generatePresignedPost(objectKey);

    // formData は { key: 'value' } オブジェクトなので整形
    const fields = Object.entries(formData).map(([key, value]) => ({
      key,
      value,
    }));
    return { postURL, fields, objectKey };
  }

  async createAttachment(input: CreateAttachmentInput, username: string) {
    const uploader = await this.prisma.user.findUniqueOrThrow({
      where: { username },
    });
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
