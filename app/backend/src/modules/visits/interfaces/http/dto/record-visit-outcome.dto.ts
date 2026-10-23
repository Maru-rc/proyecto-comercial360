import { BadRequestException } from '@nestjs/common';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OutcomeType } from '../../../domain/entities/visit-outcome.entity.js';

export class QuotationNestedDto {
  @ApiPropertyOptional({
    description: 'Unique quotation number',
    example: 'COT-2026-001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  quotationNumber?: string;

  @ApiPropertyOptional({
    description: 'Quotation number alternative',
    example: 'COT-2026-001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  number?: string;

  @ApiProperty({
    description: 'Quotation monetary amount (COP)',
    example: 450000,
  })
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
  currency?: string = 'COP';

  get resolvedNumber(): string {
    const val = this.number ?? this.quotationNumber;
    if (!val)
      throw new BadRequestException(
        'Quotation number is required (number or quotationNumber)',
      );
    return val.trim();
  }

  get resolvedAmount(): number {
    if (this.amount === undefined || this.amount === null || this.amount <= 0) {
      throw new BadRequestException(
        'Quotation amount must be a positive number',
      );
    }
    return this.amount;
  }

  get resolvedCurrency(): string {
    return this.currency ?? 'COP';
  }
}

export class OrderNestedDto {
  @ApiPropertyOptional({
    description: 'Unique order number',
    example: 'PED-2026-001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  orderNumber?: string;

  @ApiPropertyOptional({
    description: 'Order number alternative',
    example: 'PED-2026-001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  number?: string;

  @ApiProperty({ description: 'Order monetary amount in COP', example: 450000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

  @ApiPropertyOptional({
    description: 'Estimated delivery date in ISO 8601 format',
    example: '2026-10-28',
  })
  @IsOptional()
  @IsDateString()
  estimatedDeliveryDate?: string;

  get resolvedNumber(): string {
    const val = this.number ?? this.orderNumber;
    if (!val)
      throw new BadRequestException(
        'Order number is required (number or orderNumber)',
      );
    return val.trim();
  }

  get resolvedAmount(): number {
    if (this.amount === undefined || this.amount === null || this.amount <= 0) {
      throw new BadRequestException('Order amount must be a positive number');
    }
    return this.amount;
  }

  get resolvedEstimatedDeliveryDate(): string | undefined {
    return this.estimatedDeliveryDate;
  }
}

export class FollowUpNestedDto {
  @ApiPropertyOptional({
    description: 'Next contact date in ISO 8601 format',
    example: '2026-10-29T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  nextContactDate?: string;

  @ApiPropertyOptional({
    description: 'Next date alternative',
    example: '2026-10-29T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  nextDate?: string;

  @ApiProperty({
    description: 'Follow-up action/activity description',
    example: 'Dispatch confirmation',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  activity?: string;

  @ApiPropertyOptional({
    description: 'Observation (max 500 characters)',
    example: 'Check warehouse stock',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Follow-up observation cannot exceed 500 characters',
  })
  observation?: string;

  get resolvedNextDate(): string {
    const val = this.nextContactDate ?? this.nextDate;
    if (!val)
      throw new BadRequestException(
        'Next follow-up date is required (nextContactDate or nextDate)',
      );
    return val;
  }

  get resolvedActivity(): string {
    if (!this.activity)
      throw new BadRequestException('Follow-up activity is required');
    return this.activity;
  }

  get resolvedObservation(): string | undefined {
    return this.observation;
  }
}

export class RecordVisitOutcomeDto {
  @ApiProperty({
    description: 'Outcome of the visit',
    enum: ['SUCCESSFUL', 'NO_SALE', 'RESCHEDULED', 'CANCELLED'],
    example: 'SUCCESSFUL',
  })
  @IsOptional()
  @IsIn(['SUCCESSFUL', 'NO_SALE', 'RESCHEDULED', 'CANCELLED'])
  outcome?: OutcomeType;

  @ApiPropertyOptional({
    description: 'Reason if no sale was completed (max 500 characters)',
    example: 'Client has no credit quota',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Reason for no sale cannot exceed 500 characters',
  })
  reasonNoSale?: string;

  @ApiPropertyOptional({
    description: 'General observations (max 500 characters)',
    example: 'Excellent client willingness',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Observations cannot exceed 500 characters' })
  observations?: string;

  @ApiPropertyOptional({
    description: 'S3 key of evidence file',
    example: 'visits/evidence-123.jpg',
  })
  @IsOptional()
  @IsString()
  evidenceS3Key?: string;

  @ApiPropertyOptional({ description: 'Visit finish time', example: '11:30' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Rescheduled date when outcome is RESCHEDULED',
    example: '2026-10-25',
  })
  @IsOptional()
  @IsDateString()
  rescheduledDate?: string;

  @ApiPropertyOptional({
    description: 'Nested quotation object',
    type: () => QuotationNestedDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuotationNestedDto)
  quotation?: QuotationNestedDto;

  @ApiPropertyOptional({
    description: 'Nested order object',
    type: () => OrderNestedDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OrderNestedDto)
  order?: OrderNestedDto;

  @ApiPropertyOptional({
    description: 'Nested follow-up scheduling object',
    type: () => FollowUpNestedDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => FollowUpNestedDto)
  followUp?: FollowUpNestedDto;

  @ApiPropertyOptional({
    description: 'User recording outcome',
    example: 'ADVISOR',
  })
  @IsOptional()
  @IsString()
  user?: string;

  get resolvedOutcome(): OutcomeType {
    if (!this.outcome)
      throw new BadRequestException('Visit outcome is required');
    return this.outcome;
  }

  get resolvedReasonNoSale(): string | undefined {
    return this.reasonNoSale;
  }

  get resolvedObservations(): string | undefined {
    return this.observations;
  }

  get resolvedEvidenceS3Key(): string | undefined {
    return this.evidenceS3Key;
  }

  get resolvedEndTime(): string | undefined {
    return this.endTime;
  }

  get resolvedRescheduledDate(): string | undefined {
    return this.rescheduledDate;
  }

  get resolvedQuotation(): QuotationNestedDto | undefined {
    return this.quotation;
  }

  get resolvedOrder(): OrderNestedDto | undefined {
    return this.order;
  }

  get resolvedFollowUp(): FollowUpNestedDto | undefined {
    return this.followUp;
  }

  get resolvedUser(): string | undefined {
    return this.user;
  }
}
