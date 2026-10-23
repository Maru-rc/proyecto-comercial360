import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class GenerateUploadUrlDto {
  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsOptional()
  filename?: string;

  @IsString()
  @IsOptional()
  s3Key?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  fileSize?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  size?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  expiresInSeconds?: number;
}
