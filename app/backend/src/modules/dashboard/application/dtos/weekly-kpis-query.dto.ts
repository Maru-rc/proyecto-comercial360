import { IsOptional, IsInt, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

const ISO_WEEK_PATTERN = /^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/;
const ISO_WEEK_MESSAGE = 'week must follow the format YYYY-Www (e.g. 2026-W42)';

export class WeeklyKpisQueryDto {
  @ApiPropertyOptional({
    description: 'ISO week (YYYY-Www). Defaults to the current week.',
    example: '2026-W42',
  })
  @IsOptional()
  @IsString()
  @Matches(ISO_WEEK_PATTERN, { message: ISO_WEEK_MESSAGE })
  week?: string;

  @ApiPropertyOptional({
    description:
      'Spanish alias for the ISO week filter (YYYY-Www). Same value as week.',
    example: '2026-W42',
  })
  @IsOptional()
  @IsString()
  @Matches(ISO_WEEK_PATTERN, { message: ISO_WEEK_MESSAGE })
  semana?: string;

  @ApiPropertyOptional({
    description: 'Zone id filter (DIRECTOR only).',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  zone?: number;

  @ApiPropertyOptional({
    description: 'Spanish alias for the zone id filter (DIRECTOR only).',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  zona?: number;
}
