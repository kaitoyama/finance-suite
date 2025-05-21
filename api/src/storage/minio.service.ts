// storage/minio.service.ts
import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private readonly client: Client;

  constructor() {
    // Parse the endpoint URL to extract host and protocol
    const endpointUrl = new URL(process.env.S3_ENDPOINT!);
    
    this.client = new Client({
      endPoint: endpointUrl.hostname,
      port: endpointUrl.port ? parseInt(endpointUrl.port) : (endpointUrl.protocol === 'https:' ? 443 : 80),
      useSSL: endpointUrl.protocol === 'https:',
      accessKey: process.env.S3_ACCESS_KEY!,
      secretKey: process.env.S3_SECRET_KEY!,
    });
  }

  async generatePresignedPost(key: string) {
    const policy = this.client.newPostPolicy();
    policy.setBucket(process.env.S3_BUCKET!);
    policy.setKey(key);
    policy.setExpires(new Date(Date.now() + 5 * 60 * 1000));   // 5分
    return await this.client.presignedPostPolicy(policy);      // MinIO公式API:contentReference[oaicite:3]{index=3}
  }
}
