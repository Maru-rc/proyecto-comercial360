import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { STORAGE_SERVICE } from '../../domain-contracts/index.js';
import { GenerateDownloadUrlUseCase } from './application/generate-download-url/generate-download-url.use-case.js';
import { GenerateUploadUrlUseCase } from './application/generate-upload-url/generate-upload-url.use-case.js';
import { S3StorageAdapter } from './infrastructure/storage/s3-storage.adapter.js';
import { StorageController } from './interfaces/http/storage.controller.js';

@Module({
  imports: [ConfigModule],
  controllers: [StorageController],
  providers: [
    S3StorageAdapter,
    {
      provide: STORAGE_SERVICE,
      useExisting: S3StorageAdapter,
    },
    GenerateUploadUrlUseCase,
    GenerateDownloadUrlUseCase,
  ],
  exports: [
    STORAGE_SERVICE,
    GenerateUploadUrlUseCase,
    GenerateDownloadUrlUseCase,
    S3StorageAdapter,
  ],
})
export class StorageModule {}
