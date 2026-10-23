import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { BypassTransform } from '../interceptors/bypass-transform.decorator.js';
import {
  SystemHealthProbeService,
  type HealthCheckResponse,
} from './system-health-probe.service.js';

export const HEALTH_ROUTE_CONSTANTS = {
  TAG: 'health',
  PATH: 'health',
  SUMMARY: 'Health check probe for AWS / Docker load balancer',
  DESCRIPTION:
    'Verifies active connectivity to PostgreSQL RDS, S3, and memory usage.',
} as const;

export type { HealthCheckResponse };

@ApiTags(HEALTH_ROUTE_CONSTANTS.TAG)
@Controller(HEALTH_ROUTE_CONSTANTS.PATH)
export class HealthController {
  constructor(private readonly healthProbeService: SystemHealthProbeService) {}

  @Get()
  @BypassTransform()
  @ApiOperation({
    summary: HEALTH_ROUTE_CONSTANTS.SUMMARY,
    description: HEALTH_ROUTE_CONSTANTS.DESCRIPTION,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The service and all dependencies are operational.',
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description:
      'One or more critical dependencies (PostgreSQL) are not responding.',
  })
  async checkHealth(@Res() httpResponse: Response): Promise<void> {
    const { isHealthy, payload } = await this.healthProbeService.probe();
    const httpStatusCode = isHealthy
      ? HttpStatus.OK
      : HttpStatus.SERVICE_UNAVAILABLE;

    httpResponse.status(httpStatusCode).json(payload);
  }
}
