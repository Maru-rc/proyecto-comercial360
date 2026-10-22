import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class GenerateDownloadUrlDto {
  @IsString()
  @IsNotEmpty()
  s3Key: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  expiresInSeconds?: number;
}
