import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  ForbiddenOperationException,
  STORAGE_SERVICE,
} from '../../../../domain-contracts/index.js';
import type { IStorageService } from '../../../../domain-contracts/index.js';
import { parseStorageKey } from '../../domain/storage-key.js';
import { DOWNLOAD_URL_TTL_SECONDS } from '../../domain/storage.constants.js';
import type { StorageRequester } from '../storage-requester.js';

export interface GenerateDownloadUrlInputDto {
  requester: StorageRequester;
  s3Key: string;
}

export interface GenerateDownloadUrlOutputDto {
  downloadUrl: string;
  expiresInSeconds: number;
}

@Injectable()
export class GenerateDownloadUrlUseCase {
  constructor(
    @Inject(STORAGE_SERVICE)
    private readonly storageService: IStorageService,
  ) {}

  async execute(
    dto: GenerateDownloadUrlInputDto,
  ): Promise<GenerateDownloadUrlOutputDto> {
    const s3Key = dto.s3Key?.trim() ?? '';
    const parts = parseStorageKey(s3Key);
    if (!parts) {
      throw new BadRequestException('s3Key is not a valid storage key');
    }
    const isOwner = parts.ownerId === dto.requester.id;
    if (!isOwner && dto.requester.role !== 'DIRECTOR') {
      throw new ForbiddenOperationException(
        'You can only download your own files',
      );
    }

    const downloadUrl = await this.storageService.generateDownloadUrl({
      s3Key,
      expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS,
    });
    return { downloadUrl, expiresInSeconds: DOWNLOAD_URL_TTL_SECONDS };
  }
}
