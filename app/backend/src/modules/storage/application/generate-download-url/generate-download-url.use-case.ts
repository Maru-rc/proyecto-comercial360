import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { STORAGE_SERVICE } from '../../../../domain-contracts/index.js';
import type { IStorageService } from '../../../../domain-contracts/index.js';

export interface GenerateDownloadUrlInputDto {
  s3Key: string;
  expiresInSeconds?: number;
}

export interface GenerateDownloadUrlOutputDto {
  downloadUrl: string;
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
    if (!dto.s3Key?.trim()) {
      throw new BadRequestException(
        's3Key is required to generate download URL',
      );
    }

    const downloadUrl = await this.storageService.generateDownloadUrl({
      s3Key: dto.s3Key.trim(),
      expiresInSeconds: dto.expiresInSeconds ?? 3600,
    });

    return { downloadUrl };
  }
}
