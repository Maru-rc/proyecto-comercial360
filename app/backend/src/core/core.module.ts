import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfiguration } from '../config/app.config.js';
import { AppConfigService } from './infrastructure/config/app-config.service.js';
import { validateEnv } from './infrastructure/config/env.validation.js';
import { buildDataSourceOptions } from './infrastructure/database/data-source.js';

import { HealthController } from './infrastructure/health/health.controller.js';
import { SystemHealthProbeService } from './infrastructure/health/system-health-probe.service.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfiguration],
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        ...buildDataSourceOptions(),
        autoLoadEntities: true,
      }),
    }),
  ],
  controllers: [HealthController],
  providers: [AppConfigService, SystemHealthProbeService],
  exports: [AppConfigService, SystemHealthProbeService, ConfigModule],
})
export class CoreModule {}
