import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFollowUpDto {
  @ApiProperty({ description: 'Client ID', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clientId?: number;

  @ApiPropertyOptional({ description: 'Associated visit ID', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  visitId?: number;

  @ApiPropertyOptional({ description: 'Responsible advisor ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  responsibleAdvisorId?: number;

  @ApiProperty({
    description: 'Next scheduled contact date in ISO 8601',
    example: '2026-10-30T15:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  nextContactDate?: string;

  @ApiProperty({
    description: 'Follow-up activity type or description',
    example: 'Follow-up on quotation sent',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  activity?: string;

  @ApiPropertyOptional({
    description: 'Observation or agreed commitments (max 500 characters)',
    example: 'Send updated catalog',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Observation cannot exceed 500 characters' })
  observation?: string;

  get resolvedClientId(): number {
    if (!this.clientId) throw new BadRequestException('Client ID is required');
    return this.clientId;
  }

  get resolvedVisitId(): number | undefined {
    return this.visitId;
  }

  get resolvedResponsibleAdvisorId(): number | undefined {
    return this.responsibleAdvisorId;
  }

  get resolvedNextContactDate(): string {
    if (!this.nextContactDate)
      throw new BadRequestException('Next contact date is required');
    return this.nextContactDate;
  }

  get resolvedActivity(): string {
    if (!this.activity) throw new BadRequestException('Activity is required');
    return this.activity;
  }

  get resolvedObservation(): string | undefined {
    return this.observation;
  }
}
