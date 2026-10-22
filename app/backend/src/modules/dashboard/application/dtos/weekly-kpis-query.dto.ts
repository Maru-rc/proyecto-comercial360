import { IsOptional, IsInt, IsString, Matches, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class WeeklyKpisQueryDto {
  @ApiPropertyOptional({
    description: 'ISO week (YYYY-Www). Defaults to the current week.',
    example: '2026-W42',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/, {
    message: 'semana must follow the format YYYY-Www (e.g. 2026-W42)',
  })
  semana?: string;

  @ApiPropertyOptional({
    description: 'Zone id filter (DIRECTOR only).',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  zona?: number;
}
