import { Inject, Injectable, Optional } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { STORAGE_SERVICE } from '../../../domain-contracts/storage/storage-service.token.js';
import type { IStorageService } from '../../../domain-contracts/storage/storage-service.interface.js';

export const HEALTH_STATUS = {
  OK: 'ok',
  ERROR: 'error',
} as const;
export type HealthStatus = (typeof HEALTH_STATUS)[keyof typeof HEALTH_STATUS];

export const SERVICE_STATUS = {
  UP: 'up',
  DOWN: 'down',
  UNCONFIGURED: 'unconfigured',
} as const;
export type ServiceStatus =
  (typeof SERVICE_STATUS)[keyof typeof SERVICE_STATUS];

export const HEALTH_PROBE_CONSTANTS = {
  DATABASE_PING_QUERY: 'SELECT 1',
  TIMEOUT_MESSAGE: 'Database query timed out',
  DATASOURCE_UNINITIALIZED_MESSAGE: 'DataSource not initialized',
  UNKNOWN_ERROR_MESSAGE: 'Unknown database error',
  DATABASE_QUERY_TIMEOUT_MS: 2000,
  BYTES_PER_MB: 1024 * 1024,
} as const;

export interface DatabaseHealthStatus {
  status: ServiceStatus;
  responseTimeMs?: number;
  error?: string;
}

export interface MemoryHealthStatus {
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
}

export interface HealthCheckResponse {
  status: HealthStatus;
  timestamp: string;
  uptimeSeconds: number;
  services: {
    database: DatabaseHealthStatus;
    storage: {
      status: ServiceStatus;
    };
    memory: MemoryHealthStatus;
  };
}

export interface HealthProbeResult {
  isHealthy: boolean;
  payload: HealthCheckResponse;
}

@Injectable()
export class SystemHealthProbeService {
  constructor(
    @Optional()
    private readonly dataSource?: DataSource,
    @Optional()
    @Inject(STORAGE_SERVICE)
    private readonly storageService?: IStorageService,
  ) {}

  async probe(): Promise<HealthProbeResult> {
    const memory = this.getMemoryStats();
    const database = await this.pingDatabase();
    const isHealthy = database.status === SERVICE_STATUS.UP;

    const payload: HealthCheckResponse = {
      status: isHealthy ? HEALTH_STATUS.OK : HEALTH_STATUS.ERROR,
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      services: {
        database,
        storage: {
          status: this.storageService
            ? SERVICE_STATUS.UP
            : SERVICE_STATUS.UNCONFIGURED,
        },
        memory,
      },
    };

    return { isHealthy, payload };
  }

  private getMemoryStats(): MemoryHealthStatus {
    const memoryUsage = process.memoryUsage();
    return {
      heapUsedMb: Math.round(
        memoryUsage.heapUsed / HEALTH_PROBE_CONSTANTS.BYTES_PER_MB,
      ),
      heapTotalMb: Math.round(
        memoryUsage.heapTotal / HEALTH_PROBE_CONSTANTS.BYTES_PER_MB,
      ),
      rssMb: Math.round(memoryUsage.rss / HEALTH_PROBE_CONSTANTS.BYTES_PER_MB),
    };
  }

  private async pingDatabase(): Promise<DatabaseHealthStatus> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      return {
        status: SERVICE_STATUS.DOWN,
        error: HEALTH_PROBE_CONSTANTS.DATASOURCE_UNINITIALIZED_MESSAGE,
      };
    }

    const checkStartTime = Date.now();
    try {
      await Promise.race([
        this.dataSource.query(HEALTH_PROBE_CONSTANTS.DATABASE_PING_QUERY),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(HEALTH_PROBE_CONSTANTS.TIMEOUT_MESSAGE)),
            HEALTH_PROBE_CONSTANTS.DATABASE_QUERY_TIMEOUT_MS,
          ),
        ),
      ]);

      return {
        status: SERVICE_STATUS.UP,
        responseTimeMs: Date.now() - checkStartTime,
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : HEALTH_PROBE_CONSTANTS.UNKNOWN_ERROR_MESSAGE;
      return {
        status: SERVICE_STATUS.DOWN,
        responseTimeMs: Date.now() - checkStartTime,
        error: errorMessage,
      };
    }
  }
}
