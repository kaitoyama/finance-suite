// storage/minio.service.ts
import { Injectable } from '@nestjs/common';
import { Client } from 'minio';

@Injectable()
export class MinioService {
  private readonly client: Client;
  private readonly defaultBucket: string;
  private readonly pdfBucket: string; // Added for PDF specific bucket

  constructor() {
    // Parse the endpoint URL to extract host and protocol
    const endpointUrl = new URL(process.env.S3_ENDPOINT!);

    this.client = new Client({
      endPoint: endpointUrl.hostname,
      port: endpointUrl.port
        ? parseInt(endpointUrl.port)
        : endpointUrl.protocol === 'https:'
          ? 443
          : 80,
      useSSL: endpointUrl.protocol === 'https:',
      accessKey: process.env.S3_ACCESS_KEY!,
      secretKey: process.env.S3_SECRET_KEY!,
    });

    this.defaultBucket = process.env.S3_BUCKET!; // Existing default bucket
    this.pdfBucket = process.env.S3_PDF_BUCKET || 'finance-files'; // New PDF bucket
  }

  async generatePresignedPost(key: string) {
    const policy = this.client.newPostPolicy();
    policy.setBucket(this.defaultBucket); // Using default bucket for posts
    policy.setKey(key);
    policy.setExpires(new Date(Date.now() + 5 * 60 * 1000)); // 5分
    return await this.client.presignedPostPolicy(policy); // MinIO公式API:contentReference[oaicite:3]{index=3}
  }

  async uploadPdf(buffer: Buffer, key: string): Promise<void> {
    try {
      await this.client.putObject(this.pdfBucket, key, buffer, buffer.length, {
        'Content-Type': 'application/pdf',
      });
    } catch (error) {
      // Add proper logging here
      console.error(
        `Failed to upload PDF to MinIO (bucket: ${this.pdfBucket}, key: ${key})`,
        error,
      );
      throw new Error(`MinIO PDF Upload Error: ${error.message}`);
    }
  }

  async generatePresignedGetUrl(
    key: string,
    bucketName: string = this.pdfBucket,
    expirySeconds: number = 5 * 60,
  ): Promise<string> {
    try {
      return await this.client.presignedGetObject(
        bucketName,
        key,
        expirySeconds,
      );
    } catch (error) {
      // Add proper logging here
      console.error(
        `Failed to generate presigned GET URL for MinIO (bucket: ${this.pdfBucket}, key: ${key})`,
        error,
      );
      throw new Error(`MinIO Presigned URL Error: ${error.message}`);
    }
  }
}
