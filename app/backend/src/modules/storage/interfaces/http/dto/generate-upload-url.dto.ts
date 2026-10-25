import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';
import {
  STORAGE_PURPOSES,
  type StoragePurpose,
} from '../../../domain/storage-key.js';
import { MAX_FILE_SIZE_BYTES } from '../../../domain/storage.constants.js';

export class GenerateUploadUrlDto {
  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @ApiProperty({
    description: 'Exact size in bytes; it is signed',
    example: 245760,
  })
  @IsInt()
  @Min(1)
  @Max(MAX_FILE_SIZE_BYTES)
  fileSize: number;

  @ApiProperty({ enum: STORAGE_PURPOSES, example: 'visit-evidence' })
  @IsIn(STORAGE_PURPOSES)
  purpose: StoragePurpose;
}
