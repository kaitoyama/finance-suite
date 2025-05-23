// storage/minio.module.ts
import { Module, Global } from '@nestjs/common';
import { MinioService } from './minio.service';

@Global() // ★どこからでも注入できるように global
@Module({
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
