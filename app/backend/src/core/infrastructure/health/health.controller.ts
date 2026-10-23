import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Optional,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { DataSource } from 'typeorm';
import { STORAGE_SERVICE } from '../../../domain-contracts/storage/storage-service.token.js';
import type { IStorageService } from '../../../domain-contracts/storage/storage-service.interface.js';
import { BypassTransform } from '../interceptors/bypass-transform.decorator.js';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptimeSeconds: number;
  services: {
    database: {
      status: 'up' | 'down';
      responseTimeMs?: number;
      error?: string;
    };
    storage: {
      status: 'up' | 'unconfigured';
    };
    memory: {
      heapUsedMb: number;
      heapTotalMb: number;
      rssMb: number;
    };
  };
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    @Optional()
    private readonly dataSource?: DataSource,
    @Optional()
    @Inject(STORAGE_SERVICE)
    private readonly storageService?: IStorageService,
  ) {}

  @Get()
  @BypassTransform()
  @ApiOperation({
    summary: 'Health check probe para balanceador AWS / Docker',
    description:
      'Verifica la conectividad activa hacia PostgreSQL RDS, S3 y consumo de memoria.',
  })
  @ApiResponse({
    status: 200,
    description: 'El servicio y sus dependencias están operativas.',
  })
  @ApiResponse({
    status: 503,
    description:
      'Una o más dependencias críticas (PostgreSQL) no están respondiendo.',
  })
  async checkHealth(@Res() httpResponse: Response): Promise<void> {
    const memoryUsage = process.memoryUsage();
    const memoryStats = {
      heapUsedMb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotalMb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rssMb: Math.round(memoryUsage.rss / 1024 / 1024),
    };

    const databaseCheck = await this.pingDatabase();
    const isHealthy = databaseCheck.status === 'up';

    const healthPayload: HealthCheckResponse = {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      services: {
        database: databaseCheck,
        storage: {
          status: this.storageService ? 'up' : 'unconfigured',
        },
        memory: memoryStats,
      },
    };

    const httpStatusCode = isHealthy
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    httpResponse.status(httpStatusCode).json(healthPayload);
  }

  private async pingDatabase(): Promise<{
    status: 'up' | 'down';
    responseTimeMs?: number;
    error?: string;
  }> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      return { status: 'down', error: 'DataSource not initialized' };
    }

    const checkStartTime = Date.now();
    try {
      // Timeout de 2 segundos para no bloquear el probe
      await Promise.race([
        this.dataSource.query('SELECT 1'),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database query timed out')), 2000),
        ),
      ]);

      return {
        status: 'up',
        responseTimeMs: Date.now() - checkStartTime,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown database error';
      return {
        status: 'down',
        responseTimeMs: Date.now() - checkStartTime,
        error: errorMessage,
      };
    }
  }
}
