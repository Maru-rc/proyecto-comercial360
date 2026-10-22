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
  imports: [
    // Provides AuthGuard, RolesGuard and ResolveAsesorScopeUseCase
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [
    // Bind the port token to the concrete TypeORM implementation
    { provide: DASHBOARD_REPOSITORY, useClass: DashboardRepository },
    // ResolveAsesorScopeUseCase is exported by AuthModule and available in DI.
    // We bind it to our local token without importing the class directly,
    // satisfying the cross-module import rule.
    {
      provide: ASESOR_SCOPE_RESOLVER,
      useFactory: (resolver: unknown) => resolver,
      inject: ['ResolveAsesorScopeUseCase'],
    },
    GetWeeklyKpisUseCase,
  ],
})
export class DashboardModule {}
