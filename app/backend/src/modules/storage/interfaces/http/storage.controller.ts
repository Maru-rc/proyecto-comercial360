import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  Auth,
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../domain-contracts/index.js';
import { GenerateDownloadUrlUseCase } from '../../application/generate-download-url/generate-download-url.use-case.js';
import { GenerateUploadUrlUseCase } from '../../application/generate-upload-url/generate-upload-url.use-case.js';
import { GenerateDownloadUrlDto } from './dto/generate-download-url.dto.js';
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
  async generateUploadUrl(
    @Body() dto: GenerateUploadUrlDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.generateUploadUrlUseCase.execute({
      requester: user,
      purpose: dto.purpose,
      contentType: dto.contentType,
      fileSize: dto.fileSize,
    });
  }

  @Get('download-url')
  async generateDownloadUrl(
    @Query() query: GenerateDownloadUrlDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.generateDownloadUrlUseCase.execute({
      requester: user,
      s3Key: query.s3Key,
    });
  }
}
