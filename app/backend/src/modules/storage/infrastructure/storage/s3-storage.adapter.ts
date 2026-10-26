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

const SIGNED_UPLOAD_HEADERS = new Set(['content-type', 'content-length']);

@Injectable()
export class S3StorageAdapter implements IStorageService {
  private readonly logger = new Logger(S3StorageAdapter.name);
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION', 'us-east-1');
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const rawForcePathStyle = this.configService.get<string | boolean>(
      'S3_FORCE_PATH_STYLE',
    );
    const forcePathStyle =
      rawForcePathStyle === true || rawForcePathStyle === 'true';
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
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: params.s3Key,
      ContentType: params.contentType,
      ContentLength: params.fileSize,
    });

    // Content-Type and Content-Length become part of the signature: S3
    // rejects (403) an upload with another type or size than the one requested.
    return getSignedUrl(this.s3Client, command, {
      expiresIn: params.expiresInSeconds,
      signableHeaders: SIGNED_UPLOAD_HEADERS,
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
      expiresIn: params.expiresInSeconds,
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
