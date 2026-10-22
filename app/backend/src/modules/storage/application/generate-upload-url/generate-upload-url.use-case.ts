import { randomUUID } from 'node:crypto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { STORAGE_SERVICE } from '../../../../domain-contracts/index.js';
import type { IStorageService } from '../../../../domain-contracts/index.js';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from '../../domain/storage.constants.js';

export interface GenerateUploadUrlInputDto {
  s3Key?: string;
  filename?: string;
  contentType: string;
  fileSize?: number;
  size?: number;
  expiresInSeconds?: number;
}

export interface GenerateUploadUrlOutputDto {
  uploadUrl: string;
  s3Key: string;
}

@Injectable()
export class GenerateUploadUrlUseCase {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    dto: GenerateUploadUrlInputDto,
  ): Promise<GenerateUploadUrlOutputDto> {
    const mime = dto.contentType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.includes(mime as any)) {
      throw new BadRequestException(
        `File type not allowed (${dto.contentType}). Allowed types: images (JPEG, PNG, WEBP) and documents (PDF, Excel, CSV).`,
      );
    }

    const fileSize = dto.fileSize ?? dto.size;
    if (fileSize !== undefined && fileSize > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File exceeds maximum allowed size of 15MB (${fileSize} bytes)`,
      );
    }

    const key = dto.s3Key ?? this.generateKey(dto.filename ?? 'file');
    const uploadUrl = await this.storageService.generateUploadUrl({
      s3Key: key,
      contentType: mime,
      expiresInSeconds: dto.expiresInSeconds ?? 900,
    });

    return { uploadUrl, s3Key: key };
  }

  private generateKey(filename: string): string {
    const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `evidence/${Date.now()}_${randomUUID().slice(0, 8)}_${sanitized}`;
  }
}
