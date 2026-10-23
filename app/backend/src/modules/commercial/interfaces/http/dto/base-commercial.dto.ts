import { BadRequestException } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsPositive } from 'class-validator';

export abstract class BaseCommercialDocumentDto {
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

  @ApiPropertyOptional({ description: 'Total amount', example: 150000 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  amount?: number;

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
}
