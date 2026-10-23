import { BadRequestException } from '@nestjs/common';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';
import type { OrderStatus } from '../../../domain/entities/order.entity.js';
import { BaseCommercialDocumentDto } from './base-commercial.dto.js';

export class CreateOrderDto extends BaseCommercialDocumentDto {
  @ApiPropertyOptional({
    description: 'Unique order number',
    example: 'PED-2026-1001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  orderNumber?: string;

  @ApiPropertyOptional({
    description: 'Order number alternative',
    example: 'PED-2026-1001',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  number?: string;

  @ApiPropertyOptional({
    description: 'Quotation ID if converted from quotation',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quotationId?: number;

  @ApiPropertyOptional({
    description: 'Order status',
    enum: [
      'PENDING',
      'CONFIRMED',
      'IN_PROCESS',
      'DISPATCHED',
      'DELIVERED',
      'CANCELLED',
    ],
    default: 'PENDING',
  })
  @IsOptional()
  @IsIn([
    'PENDING',
    'CONFIRMED',
    'IN_PROCESS',
    'DISPATCHED',
    'DELIVERED',
    'CANCELLED',
  ])
  status?: OrderStatus;

  @ApiPropertyOptional({ description: 'Order placement date in ISO 8601' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Estimated delivery date in ISO 8601' })
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

  get resolvedQuotationId(): number | undefined {
    return this.quotationId;
  }

  get resolvedStatus(): OrderStatus {
    return this.status ?? 'PENDING';
  }

  get resolvedDate(): string | undefined {
    return this.date;
  }

  get resolvedEstimatedDeliveryDate(): string | undefined {
    return this.estimatedDeliveryDate;
  }
}
