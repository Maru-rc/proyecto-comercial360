import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfiguration } from '../config/app.config.js';
import { AppConfigService } from './infrastructure/config/app-config.service.js';
import { envValidationSchema } from './infrastructure/config/env.validation.js';
import { buildDataSourceOptions } from './infrastructure/database/data-source.js';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfiguration],
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        ...buildDataSourceOptions(),
        autoLoadEntities: true,
      }),
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService, ConfigModule],
})
export class CoreModule {}
