import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VisitTrackingQueryDto {
  @ApiPropertyOptional({
    description: 'Period filter. Defaults to the current week.',
    enum: ['today', 'week', 'month'],
    example: 'week',
  })
  @IsOptional()
  @IsIn([
    'today',
    'week',
    'month',
    'hoy',
    'semana',
    'mes',
    'Hoy',
    'Esta semana',
    'Este mes',
  ])
  periodo?: string;

  @ApiPropertyOptional({
    description: 'Visit status filter (case insensitive).',
    example: 'VISITADO',
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Route filter.',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ruta?: number;

  @ApiPropertyOptional({
    description: 'Customer type filter.',
    example: 'Industrial',
  })
  @IsOptional()
  @IsString()
  tipo_cliente?: string;

  @ApiPropertyOptional({
    description: 'Potential filter.',
    example: 'Alto',
  })
  @IsOptional()
  @IsString()
  potencial?: string;

  @ApiPropertyOptional({
    description: 'Advisor filter (DIRECTOR only).',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  asesor?: number;

  @ApiPropertyOptional({
    description: 'Page number (1-based).',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Page size.',
    default: 10,
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
