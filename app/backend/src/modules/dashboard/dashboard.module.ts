import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { DashboardRepository } from './infrastructure/dashboard.repository.js';
import { GetWeeklyKpisUseCase } from './application/use-cases/get-weekly-kpis.use-case.js';
import { DASHBOARD_REPOSITORY } from './application/ports/dashboard.repository.port.js';
import { DashboardController } from './dashboard.controller.js';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController],
  providers: [
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    GetWeeklyKpisUseCase,
  ],
  exports: [GetWeeklyKpisUseCase],
})
export class DashboardModule {}
