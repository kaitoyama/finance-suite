import { Resolver, Query, Args } from '@nestjs/graphql';
import { MinioService } from './storage/minio.service';
import { Logger } from '@nestjs/common';

@Resolver()
export class AppResolver {
  private readonly logger = new Logger(AppResolver.name);
  constructor(
    private readonly minioService: MinioService,
  ) {}

  @Query(() => String, { description: 'Health-check' })
  hello() {
    return 'hello world';
  }

  @Query(() => String, { name: 'getPresignedS3Url', nullable: true })
  async getPresignedS3Url(
    @Args('key', { type: () => String }) key: string,
  ): Promise<string | null> {
    if (!key) {
      this.logger.warn('getPresignedS3Url called with no key.');
      return null;
    }
    try {
      const url = await this.minioService.generatePresignedGetUrl(key);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for key: ${key}`, error);
      // Depending on desired behavior, you might rethrow or return null
      // For now, returning null to indicate failure to the client gracefully
      return null; 
    }
  }
}
