import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

import { CoreModule } from './core/core.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { CommercialModule } from './modules/commercial/commercial.module.js';
import { DashboardModule } from './modules/dashboard/dashboard.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { RoutesModule } from './modules/routes/routes.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { VisitsModule } from './modules/visits/visits.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: process.env.OBSERVE_APP_KEY ?? 'YOUR_APP_KEY',
      appSecret: process.env.OBSERVE_APP_SECRET ?? 'YOUR_APP_SECRET',
      serviceId: 'backend',
    }),
    CoreModule,
    AuthModule,
    ClientsModule,
    RoutesModule,
    VisitsModule,
    CommercialModule,
    DashboardModule,
    ReportsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
