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
import type { OrderStatus } from '../../../domain/entities/order.entity.js';

export class CreateOrderDto {
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
    description: 'Visit ID if order created during visit',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  visitId?: number;

  @ApiPropertyOptional({
    description: 'Quotation ID if converted from quotation',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  quotationId?: number;

  @ApiProperty({ description: 'Order monetary amount in COP', example: 980000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

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

  get resolvedQuotationId(): number | undefined {
    return this.quotationId;
  }

  get resolvedAmount(): number {
    if (this.amount === undefined || this.amount === null || this.amount <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }
    return this.amount;
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
