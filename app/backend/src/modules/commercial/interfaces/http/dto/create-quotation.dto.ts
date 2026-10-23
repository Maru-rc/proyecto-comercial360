import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import type { QuotationStatus } from '../../../domain/entities/quotation.entity.js';
import { BaseCommercialDocumentDto } from './base-commercial.dto.js';

export class CreateQuotationDto extends BaseCommercialDocumentDto {
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
