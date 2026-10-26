import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVisitDto {
  @ApiProperty({ description: 'Client ID', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clientId?: number;

  @ApiPropertyOptional({
    description: 'Advisor ID (defaults to authenticated advisor)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  advisorId?: number;

  @ApiPropertyOptional({
    description: 'Route ID if associated with a route stop',
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  routeId?: number | null;

  @ApiPropertyOptional({
    description: 'Scheduled date (YYYY-MM-DD)',
    example: '2026-10-22',
  })
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @ApiPropertyOptional({ description: 'Stop sequence order', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  visitOrder?: number;

  @ApiPropertyOptional({
    description: 'Scheduled start time',
    example: '08:30',
  })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({
    description: 'Visit type (e.g. IN_PERSON, EXTRAORDINARY)',
    example: 'EXTRAORDINARY',
  })
  @IsOptional()
  @IsString()
  visitType?: string;

  @ApiPropertyOptional({
    description: 'Visit objective (max 500 characters)',
    example: 'Emergency unscheduled visit',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Objective cannot exceed 500 characters' })
  objective?: string;

  get resolvedClientId(): number {
    if (!this.clientId) throw new BadRequestException('Client ID is required');
    return this.clientId;
  }

  get resolvedAdvisorId(): number | undefined {
    return this.advisorId;
  }

  get resolvedRouteId(): number | null {
    return this.routeId ?? null;
  }

  get resolvedScheduledDate(): string {
    return this.scheduledDate ?? new Date().toISOString().slice(0, 10);
  }

  get resolvedVisitOrder(): number {
    return this.visitOrder ?? 1;
  }

  get resolvedStartTime(): string | null {
    return this.startTime ?? null;
  }

  get resolvedVisitType(): string {
    return this.visitType ?? 'IN_PERSON';
  }

  get resolvedObjective(): string | null {
    return this.objective ?? null;
  }
}
