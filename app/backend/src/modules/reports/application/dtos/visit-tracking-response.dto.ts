import { ApiProperty } from '@nestjs/swagger';
import type { PaginationMeta } from '../../../../domain-contracts/index.js';

export class VisitTrackingRowDto {
  @ApiProperty({ example: 42 })
  visitId: number;

  @ApiProperty({ example: '2026-10-21' })
  date: string;

  @ApiProperty({ example: 'Juan Perez', nullable: true })
  advisorName: string | null;

  @ApiProperty({ example: 'NORTE', nullable: true })
  territory: string | null;

  @ApiProperty({ example: 43 })
  week: number;

  @ApiProperty({ example: 'Tuesday' })
  day: string;

  @ApiProperty({ example: 'RUT-002', nullable: true })
  route: string | null;

  @ApiProperty({ example: 'Metalurgicas S.A.S' })
  customer: string;

  @ApiProperty({ example: 'Barranquilla', nullable: true })
  municipality: string | null;

  @ApiProperty({ example: 'Industrial', nullable: true })
  customerType: string | null;

  @ApiProperty({ example: 'Alto', nullable: true })
  potential: string | null;

  @ApiProperty({ example: 'VISITADO' })
  visitStatus: string;

  @ApiProperty({ example: 'Interesado', nullable: true })
  outcome: string | null;

  @ApiProperty({ example: 'COT-1242', nullable: true })
  quoteNumber: string | null;

  @ApiProperty({ example: 24800000 })
  quoteAmount: number;

  @ApiProperty({ example: 'PED-568', nullable: true })
  orderNumber: string | null;

  @ApiProperty({ example: '2026-10-28', nullable: true })
  nextFollowUpDate: string | null;
}

export class VisitTrackingResponseDto {
  @ApiProperty({ type: [VisitTrackingRowDto] })
  data: VisitTrackingRowDto[];

  @ApiProperty({
    type: 'object',
    properties: {
      total: { type: 'number', example: 24 },
      page: { type: 'number', example: 1 },
      limit: { type: 'number', example: 5 },
      totalPages: { type: 'number', example: 5 },
      hasNextPage: { type: 'boolean', example: true },
      hasPreviousPage: { type: 'boolean', example: false },
    },
  })
  meta: PaginationMeta;
}
