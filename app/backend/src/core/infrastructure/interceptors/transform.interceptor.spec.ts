import { describe, expect, it, vi } from 'vitest';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor.js';
import { BYPASS_TRANSFORM_METADATA_KEY } from './bypass-transform.decorator.js';

describe('TransformInterceptor', () => {
  const createMockContext = (options?: {
    url?: string;
    statusCode?: number;
    headersSent?: boolean;
    bypassHandler?: boolean;
    bypassClass?: boolean;
    correlationId?: string;
  }) => {
    const requestUrl = options?.url ?? '/api/commercial/quotations';
    const responseStatusCode = options?.statusCode ?? 200;
    const responseHeadersSent = options?.headersSent ?? false;

    const mockResponse = {
      statusCode: responseStatusCode,
      headersSent: responseHeadersSent,
    };

    const mockRequest = {
      url: requestUrl,
      correlationId: options?.correlationId,
      startTime: Date.now() - 5,
    };

    const reflectorMock = {
      get: vi.fn((key: string, target: unknown) => {
        if (key === BYPASS_TRANSFORM_METADATA_KEY) {
          if (target === 'HANDLER') return options?.bypassHandler ?? false;
          if (target === 'CLASS') return options?.bypassClass ?? false;
        }
        return false;
      }),
    } as unknown as Reflector;

    const mockContext: ExecutionContext = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
        getNext: vi.fn(),
      }),
      getHandler: () => 'HANDLER',
      getClass: () => 'CLASS',
      getArgs: vi.fn(),
      getArgByIndex: vi.fn(),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn(),
      getType: vi.fn(),
    };

    return { mockContext, reflectorMock };
  };

  const createMockCallHandler = (result: unknown): CallHandler => ({
    handle: () => of(result),
  });

  it('should wrap a plain payload in an envelope containing data and meta with durationMs', async () => {
    const { mockContext, reflectorMock } = createMockContext({
      url: '/api/visits/1',
      statusCode: 200,
    });
    const interceptor = new TransformInterceptor(reflectorMock);
    const plainPayload = { id: 1, clientName: 'Empresa XYZ' };

    const interceptedObservable = interceptor.intercept(
      mockContext,
      createMockCallHandler(plainPayload),
    );
    const finalResponse = await lastValueFrom(interceptedObservable);

    expect(finalResponse).toEqual({
      data: plainPayload,
      meta: {
        statusCode: 200,
        timestamp: expect.any(String),
        path: '/api/visits/1',
        durationMs: expect.any(Number),
      },
    });
  });

  it('should include correlationId in meta if present on request', async () => {
    const { mockContext, reflectorMock } = createMockContext({
      url: '/api/visits/1',
      statusCode: 200,
      correlationId: 'trace-abc-123',
    });
    const interceptor = new TransformInterceptor(reflectorMock);
    const plainPayload = { id: 1 };

    const interceptedObservable = interceptor.intercept(
      mockContext,
      createMockCallHandler(plainPayload),
    );
    const finalResponse = (await lastValueFrom(
      interceptedObservable,
    )) as Record<string, any>;

    expect(finalResponse.meta.correlationId).toBe('trace-abc-123');
  });

  it('should wrap undefined/void return as data: null with meta', async () => {
    const { mockContext, reflectorMock } = createMockContext({
      url: '/api/storage/delete',
      statusCode: 204,
    });
    const interceptor = new TransformInterceptor(reflectorMock);

    const interceptedObservable = interceptor.intercept(
      mockContext,
      createMockCallHandler(undefined),
    );
    const finalResponse = await lastValueFrom(interceptedObservable);

    expect(finalResponse).toEqual({
      data: null,
      meta: {
        statusCode: 204,
        timestamp: expect.any(String),
        path: '/api/storage/delete',
        durationMs: expect.any(Number),
      },
    });
  });

  it('should preserve and merge existing meta when response is pre-enveloped (e.g. pagination)', async () => {
    const { mockContext, reflectorMock } = createMockContext({
      url: '/api/commercial/orders?page=2',
      statusCode: 200,
    });
    const interceptor = new TransformInterceptor(reflectorMock);
    const paginatedResponse = {
      data: [{ orderId: 'ORD-1' }, { orderId: 'ORD-2' }],
      meta: {
        total: 50,
        page: 2,
        limit: 10,
      },
    };

    const interceptedObservable = interceptor.intercept(
      mockContext,
      createMockCallHandler(paginatedResponse),
    );
    const finalResponse = await lastValueFrom(interceptedObservable);

    expect(finalResponse).toEqual({
      data: paginatedResponse.data,
      meta: {
        statusCode: 200,
        timestamp: expect.any(String),
        path: '/api/commercial/orders?page=2',
        durationMs: expect.any(Number),
        total: 50,
        page: 2,
        limit: 10,
      },
    });
  });

  it('should bypass transformation when @BypassTransform is set on handler', async () => {
    const { mockContext, reflectorMock } = createMockContext({
      bypassHandler: true,
    });
    const interceptor = new TransformInterceptor(reflectorMock);
    const rawBuffer = Buffer.from('PDF_CONTENT');

    const interceptedObservable = interceptor.intercept(
      mockContext,
      createMockCallHandler(rawBuffer),
    );
    const finalResponse = await lastValueFrom(interceptedObservable);

    expect(finalResponse).toBe(rawBuffer);
  });

  it('should bypass transformation for Swagger docs endpoints (/api/docs)', async () => {
    const { mockContext, reflectorMock } = createMockContext({
      url: '/api/docs/swagger-ui-init.js',
    });
    const interceptor = new TransformInterceptor(reflectorMock);
    const swaggerContent = 'var swagger = {};';

    const interceptedObservable = interceptor.intercept(
      mockContext,
      createMockCallHandler(swaggerContent),
    );
    const finalResponse = await lastValueFrom(interceptedObservable);

    expect(finalResponse).toBe(swaggerContent);
  });
});
