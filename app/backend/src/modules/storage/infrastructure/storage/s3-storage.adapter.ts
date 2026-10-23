import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
  type S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  GenerateDownloadUrlParams,
  GenerateUploadUrlParams,
  IStorageService,
} from '../../../../domain-contracts/index.js';

@Injectable()
export class S3StorageAdapter implements IStorageService {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const forcePathStyle =
      this.configService.get<string>('S3_FORCE_PATH_STYLE') === 'true';
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.bucketName = this.configService.get<string>(
      'AWS_S3_BUCKET_NAME',
      'comercial360-multimedia',
    );

    const clientConfig: S3ClientConfig = {
      region,
      forcePathStyle,
    };

    if (endpoint) {
      clientConfig.endpoint = endpoint;
    }

    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = {
        accessKeyId,
        secretAccessKey,
      };
    }

    this.s3Client = new S3Client(clientConfig);
    this.logger.log(
      `S3StorageAdapter initialized (Bucket: ${this.bucketName}, Endpoint: ${endpoint || 'AWS S3'}, ForcePathStyle: ${forcePathStyle})`,
    );
  }

  async generateUploadUrl(params: GenerateUploadUrlParams): Promise<string> {
    const contentType = params.contentType || params.mimeType;
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.s3Key,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: params.expiresInSeconds ?? 900,
    });
  }

  async generateDownloadUrl(
    params: GenerateDownloadUrlParams,
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: params.s3Key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: params.expiresInSeconds ?? 3600,
    });
  }

  async deleteObject(s3Key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: s3Key,
    });
    await this.s3Client.send(command);
  }
}
