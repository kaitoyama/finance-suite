import { Module } from '@nestjs/common';
import { AttachmentsResolver } from './attachments.resolver';
import { AttachmentsService } from './attachments.service';

@Module({
  providers: [AttachmentsResolver, AttachmentsService],
})
export class AttachmentsModule {}
