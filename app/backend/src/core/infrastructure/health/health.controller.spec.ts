import { describe, expect, it, vi } from 'vitest';
import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import type { DataSource } from 'typeorm';
import { HealthController } from './health.controller.js';
import { SystemHealthProbeService } from './system-health-probe.service.js';

describe('HealthController & SystemHealthProbeService', () => {
  const createMockResponse = () => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const mockResponse = {
      status: statusMock,
      json: jsonMock,
    } as unknown as Response;

    return { mockResponse, statusMock, jsonMock };
  };

  it('should return 200 OK and status "ok" when database responds', async () => {
    const mockDataSource = {
      isInitialized: true,
      query: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    } as unknown as DataSource;

    const probeService = new SystemHealthProbeService(mockDataSource);
    const controller = new HealthController(probeService);
    const { mockResponse, statusMock, jsonMock } = createMockResponse();

    await controller.checkHealth(mockResponse);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.OK);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'ok',
        services: expect.objectContaining({
          database: expect.objectContaining({
            status: 'up',
          }),
        }),
      }),
    );
  });

  it('should return 503 SERVICE_UNAVAILABLE when database query rejects', async () => {
    const mockDataSource = {
      isInitialized: true,
      query: vi.fn().mockRejectedValue(new Error('Connection lost')),
    } as unknown as DataSource;

    const probeService = new SystemHealthProbeService(mockDataSource);
    const controller = new HealthController(probeService);
    const { mockResponse, statusMock, jsonMock } = createMockResponse();

    await controller.checkHealth(mockResponse);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        services: expect.objectContaining({
          database: expect.objectContaining({
            status: 'down',
            error: 'Connection lost',
          }),
        }),
      }),
    );
  });

  it('should return 503 when dataSource is not initialized', async () => {
    const mockDataSource = {
      isInitialized: false,
    } as unknown as DataSource;

    const probeService = new SystemHealthProbeService(mockDataSource);
    const controller = new HealthController(probeService);
    const { mockResponse, statusMock, jsonMock } = createMockResponse();

    await controller.checkHealth(mockResponse);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        services: expect.objectContaining({
          database: expect.objectContaining({
            status: 'down',
            error: 'DataSource not initialized',
          }),
        }),
      }),
    );
  });
});
