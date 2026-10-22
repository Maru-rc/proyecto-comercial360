import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { QuotationStatus } from '../../../domain/entities/quotation.entity.js';

export class CreateQuotationDto {
  @ApiPropertyOptional({
    description: 'Unique quotation number',
    example: 'COT-2026-1001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  quotationNumber?: string;

  @ApiPropertyOptional({
    description: 'Quotation number alternative',
    example: 'COT-2026-1001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  number?: string;

  @ApiProperty({ description: 'Client ID', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  clientId?: number;

  @ApiPropertyOptional({ description: 'Advisor ID', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  advisorId?: number;

  @ApiPropertyOptional({
    description: 'Visit ID if created during visit',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  visitId?: number;

  @ApiProperty({ description: 'Monetary amount in COP', example: 1250000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Currency code, strictly COP',
    example: 'COP',
    default: 'COP',
  })
  @IsOptional()
  @IsIn(['COP'], { message: 'Currency must strictly be COP' })
  currency?: string;

  @ApiPropertyOptional({
    description: 'Quotation status',
    enum: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
    default: 'DRAFT',
  })
  @IsOptional()
  @IsIn(['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'])
  status?: QuotationStatus;

  @ApiPropertyOptional({ description: 'Creation date in ISO 8601 format' })
  @IsOptional()
  @IsDateString()
  date?: string;

  get resolvedNumber(): string {
    const val = this.number ?? this.quotationNumber;
    if (!val)
      throw new BadRequestException(
        'Quotation number is required (number or quotationNumber)',
      );
    return val.trim();
  }

  get resolvedClientId(): number {
    if (!this.clientId) throw new BadRequestException('Client ID is required');
    return this.clientId;
  }

  get resolvedAdvisorId(): number | undefined {
    return this.advisorId;
  }

  get resolvedVisitId(): number | undefined {
    return this.visitId;
  }

  get resolvedAmount(): number {
    if (this.amount === undefined || this.amount === null || this.amount <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }
    return this.amount;
  }

  get resolvedCurrency(): string {
    return this.currency ?? 'COP';
  }

  get resolvedStatus(): QuotationStatus {
    return this.status ?? 'DRAFT';
  }

  get resolvedDate(): string | undefined {
    return this.date;
  }
}
