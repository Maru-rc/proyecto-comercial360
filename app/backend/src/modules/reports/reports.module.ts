import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ReportsController } from './reports.controller.js';
import { VisitTrackingController } from './visit-tracking.controller.js';
import { VisitTrackingCsvController } from './visit-tracking-csv.controller.js';
import { GetVisitTrackingUseCase } from './application/use-cases/get-visit-tracking.use-case.js';
import { TRACKING_SCOPE_RESOLVER } from './application/ports/tracking-scope-resolver.port.js';
import { ExportVisitTrackingCsvUseCase } from './application/use-cases/export-visit-tracking-csv.use-case.js';
import { VisitTrackingCsvExporter } from './infrastructure/visit-tracking-csv.exporter.js';
import { VISIT_TRACKING_REPOSITORY } from './application/ports/visit-tracking.port.js';
import { VisitTrackingRepository } from './infrastructure/visit-tracking.repository.js';

@Module({
  imports: [AuthModule],
  controllers: [
    ReportsController,
    VisitTrackingController,
    VisitTrackingCsvController,
  ],
  providers: [
    {
      provide: VISIT_TRACKING_REPOSITORY,
      useClass: VisitTrackingRepository,
    },
    {
      provide: TRACKING_SCOPE_RESOLVER,
      useFactory: (resolver: unknown) => resolver,
      inject: ['ResolveAdvisorScopeUseCase'],
    },
    GetVisitTrackingUseCase,
    ExportVisitTrackingCsvUseCase,
    VisitTrackingCsvExporter,
  ],
})
export class ReportsModule {}
