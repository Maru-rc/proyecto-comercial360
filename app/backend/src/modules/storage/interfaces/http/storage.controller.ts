import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../../auth/public-api.js';
import { GenerateDownloadUrlUseCase } from '../../application/generate-download-url/generate-download-url.use-case.js';
import { GenerateUploadUrlUseCase } from '../../application/generate-upload-url/generate-upload-url.use-case.js';
import { GenerateUploadUrlDto } from './dto/generate-upload-url.dto.js';

// HU-10: requires a valid session (401 without a session)
@ApiTags('Storage')
@Auth()
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
