import { Injectable } from '@nestjs/common';
import { VisitTrackingQueryDto } from '../application/dtos/visit-tracking-query.dto.js';
import type { VisitTrackingRow } from '../application/ports/visit-tracking.port.js';
import { ExportVisitTrackingCsvUseCase } from '../application/use-cases/export-visit-tracking-csv.use-case.js';

const BOM = '\uFEFF';

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'object') {
    return '';
  }
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  if (typeof value === 'number') {
    if (Number.isNaN(value) || !Number.isFinite(value)) {
      return '';
    }
    return String(value);
  }
  const stringValue = value as string;
  if (
    stringValue.includes(',') ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

@Injectable()
export class VisitTrackingCsvExporter {
  constructor(private readonly exportUseCase: ExportVisitTrackingCsvUseCase) {}

  async buildCsv(
    user: { id: string; email: string; role: string },
    dto: VisitTrackingQueryDto,
  ): Promise<string> {
    const rows = await this.exportUseCase.execute(user, dto);

    const headers = [
      'visitId',
      'date',
      'advisorName',
      'territory',
      'week',
      'day',
      'route',
      'customer',
      'municipality',
      'customerType',
      'potential',
      'visitStatus',
      'outcome',
      'quoteNumber',
      'quoteAmount',
      'orderNumber',
      'nextFollowUpDate',
    ];

    const csvLines = [
      headers.join(','),
      ...rows.map((row: VisitTrackingRow) =>
        [
          row.visitId,
          row.date,
          row.advisorName,
          row.territory,
          row.week,
          row.day,
          row.route,
          row.customer,
          row.municipality,
          row.customerType,
          row.potential,
          row.visitStatus,
          row.outcome,
          row.quoteNumber,
          row.quoteAmount,
          row.orderNumber,
          row.nextFollowUpDate,
        ]
          .map((value) => escapeCsvValue(value))
          .join(','),
      ),
    ];

    return BOM + csvLines.join('\r\n') + '\r\n';
  }
}
