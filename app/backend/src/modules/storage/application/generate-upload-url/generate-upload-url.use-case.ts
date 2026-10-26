import { randomUUID } from 'node:crypto';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ForbiddenOperationException,
  STORAGE_SERVICE,
} from '../../../../domain-contracts/index.js';
import type { IStorageService } from '../../../../domain-contracts/index.js';
import {
  buildStorageKey,
  type StoragePurpose,
} from '../../domain/storage-key.js';
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  UPLOAD_URL_TTL_SECONDS,
  type AllowedMimeType,
} from '../../domain/storage.constants.js';
import type { StorageRequester } from '../storage-requester.js';

export interface GenerateUploadUrlInputDto {
  requester: StorageRequester;
  purpose: StoragePurpose;
  contentType: string;
  fileSize: number;
}

export interface GenerateUploadUrlOutputDto {
  uploadUrl: string;
  s3Key: string;
  expiresInSeconds: number;
  /** Headers the client must send with the PUT: they are part of the signature. */
  headers: { 'Content-Type': string };
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
    const mimeType = this.assertAllowedMime(dto.contentType);
    this.assertSize(dto.fileSize);
    if (dto.purpose === 'client-import' && dto.requester.role !== 'DIRECTOR') {
      throw new ForbiddenOperationException(
        'Only a director can upload client import files',
      );
    }

    const s3Key = buildStorageKey({
      purpose: dto.purpose,
      ownerId: dto.requester.id,
      mimeType,
      now: new Date(),
      uuid: randomUUID(),
    });
    const uploadUrl = await this.storageService.generateUploadUrl({
      s3Key,
      contentType: mimeType,
      fileSize: dto.fileSize,
      expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
    });

    return {
      uploadUrl,
      s3Key,
      expiresInSeconds: UPLOAD_URL_TTL_SECONDS,
      headers: { 'Content-Type': mimeType },
    };
  }

  private assertAllowedMime(contentType: string): AllowedMimeType {
    const mime = contentType.toLowerCase().trim();
    if (!ALLOWED_MIME_TYPES.includes(mime as AllowedMimeType)) {
      throw new BadRequestException(
        `File type not allowed (${contentType}). Allowed types: images (JPEG, PNG, WEBP) and documents (PDF, Excel, CSV).`,
      );
    }
    return mime as AllowedMimeType;
  }

  private assertSize(fileSize: number): void {
    if (!Number.isInteger(fileSize) || fileSize <= 0) {
      throw new BadRequestException('fileSize must be a positive integer');
    }
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File exceeds maximum allowed size of 15MB (${fileSize} bytes)`,
      );
    }
  }
}
