import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthGuard } from '../auth/presentation/auth.guard.js';
import type { RequestWithUser } from '../auth/presentation/auth.guard.js';
import { RolesGuard } from '../auth/presentation/roles.guard.js';
import { VisitTrackingQueryDto } from './application/dtos/visit-tracking-query.dto.js';
import { VisitTrackingCsvExporter } from './infrastructure/visit-tracking-csv.exporter.js';

@ApiTags('reports')
@ApiCookieAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('reportes')
export class VisitTrackingCsvController {
  constructor(private readonly csvExporter: VisitTrackingCsvExporter) {}

  @Get('seguimiento.csv')
  @ApiOperation({ summary: 'Export visit tracking table to CSV (HU-18)' })
  @ApiProduces('text/csv')
  async exportSeguimiento(
    @Query() query: VisitTrackingQueryDto,
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ): Promise<void> {
    const date = new Date().toISOString().slice(0, 10);
    const csv = await this.csvExporter.buildCsv(req.authUser!, query);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="seguimiento_${date}.csv"`,
    );
    res.send(csv);
  }
}
