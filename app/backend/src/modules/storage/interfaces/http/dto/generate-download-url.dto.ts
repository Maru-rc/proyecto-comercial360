import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class GenerateDownloadUrlDto {
  @ApiProperty({
    example:
      'visit-evidence/abc123/2026/10/3f2a8c1e-1b2c-4d5e-8f90-1a2b3c4d5e6f.jpg',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  s3Key: string;
}
