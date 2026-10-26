import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { CoreModule } from './core/core.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { CommercialModule } from './modules/commercial/commercial.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { FollowUpsModule } from './modules/follow-ups/follow-ups.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { RoutesModule } from './modules/routes/routes.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { VisitsModule } from './modules/visits/visits.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

/** NestJS Observe only runs with real credentials, never with placeholders. */
export const isObserveEnabled = Boolean(
  process.env.OBSERVE_APP_KEY && process.env.OBSERVE_APP_SECRET,
);

const observeImports = isObserveEnabled
  ? [
      ObserveModule.forRoot({
        appKey: process.env.OBSERVE_APP_KEY!,
        appSecret: process.env.OBSERVE_APP_SECRET!,
        serviceId: 'backend',
      }),
    ]
  : [];

@Module({
  imports: [
    ...observeImports,
    CoreModule,
    AuthModule,
    ClientsModule,
    RoutesModule,
    VisitsModule,
    CommercialModule,
    FollowUpsModule,
    DashboardModule,
    ReportsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
