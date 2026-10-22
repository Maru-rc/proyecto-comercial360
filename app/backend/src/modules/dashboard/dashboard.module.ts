import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DashboardRepository } from './infrastructure/dashboard.repository.js';
import {
  GetWeeklyKpisUseCase,
  ASESOR_SCOPE_RESOLVER,
} from './application/use-cases/get-weekly-kpis.use-case.js';
import { DASHBOARD_REPOSITORY } from './application/ports/dashboard.repository.port.js';
import { DashboardController } from './dashboard.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    {
      provide: ASESOR_SCOPE_RESOLVER,
      useFactory: (resolver: unknown) => resolver,
      inject: ['ResolveAsesorScopeUseCase'],
    },
    GetWeeklyKpisUseCase,
  ],
})
export class DashboardModule {}
