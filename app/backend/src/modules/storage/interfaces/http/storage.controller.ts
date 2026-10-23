import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { GenerateDownloadUrlUseCase } from '../../application/generate-download-url/generate-download-url.use-case.js';
import { GenerateUploadUrlUseCase } from '../../application/generate-upload-url/generate-upload-url.use-case.js';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto.js';

@Controller('storage')
export class StorageController {
  constructor(
    private readonly generateUploadUrlUseCase: GenerateUploadUrlUseCase,
    private readonly generateDownloadUrlUseCase: GenerateDownloadUrlUseCase,
  ) {}

  @Post('upload-url')
  async generateUploadUrl(@Body() dto: GenerateUploadUrlDto) {
    return this.generateUploadUrlUseCase.execute({
      contentType: dto.contentType,
      filename: dto.filename,
      s3Key: dto.s3Key,
      fileSize: dto.fileSize ?? dto.size,
      expiresInSeconds: dto.expiresInSeconds,
    });
  }

  @Get('download-url')
  async generateDownloadUrl(
    @Query('s3Key') s3Key: string,
    @Query('expiresInSeconds') expiresInSeconds?: string,
  ) {
    const expires = expiresInSeconds
      ? parseInt(expiresInSeconds, 10)
      : undefined;
    return this.generateDownloadUrlUseCase.execute({
      s3Key,
      expiresInSeconds: expires,
    });
  }
}
