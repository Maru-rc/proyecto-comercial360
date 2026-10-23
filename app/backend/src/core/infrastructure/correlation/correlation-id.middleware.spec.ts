import { describe, expect, it, vi } from 'vitest';
import type { Response } from 'express';
import {
  CORRELATION_ID_HEADER,
  CorrelationIdMiddleware,
  type RequestWithCorrelation,
} from './correlation-id.middleware.js';
import { CorrelationContext } from './correlation-context.js';

describe('CorrelationIdMiddleware', () => {
  it('should generate a new UUID if no correlation header is provided', () => {
    const middleware = new CorrelationIdMiddleware();
    const mockRequest: Partial<RequestWithCorrelation> = {
      headers: {},
    };
    const setHeaderMock = vi.fn();
    const mockResponse = {
      setHeader: setHeaderMock,
    } as unknown as Response;

    let capturedContextId: string | undefined;
    const nextMock = vi.fn(() => {
      capturedContextId = CorrelationContext.getCorrelationId();
    });

    middleware.use(
      mockRequest as RequestWithCorrelation,
      mockResponse,
      nextMock,
    );

    expect(mockRequest.correlationId).toBeDefined();
    expect(mockRequest.startTime).toBeDefined();
    expect(setHeaderMock).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      mockRequest.correlationId,
    );
    expect(nextMock).toHaveBeenCalled();
    expect(capturedContextId).toBe(mockRequest.correlationId);
  });

  it('should reuse provided x-correlation-id header', () => {
    const middleware = new CorrelationIdMiddleware();
    const clientCorrelationId = 'client-trace-12345';
    const mockRequest: Partial<RequestWithCorrelation> = {
      headers: {
        'x-correlation-id': clientCorrelationId,
      },
    };
    const setHeaderMock = vi.fn();
    const mockResponse = {
      setHeader: setHeaderMock,
    } as unknown as Response;

    let capturedContextId: string | undefined;
    const nextMock = vi.fn(() => {
      capturedContextId = CorrelationContext.getCorrelationId();
    });

    middleware.use(
      mockRequest as RequestWithCorrelation,
      mockResponse,
      nextMock,
    );

    expect(mockRequest.correlationId).toBe(clientCorrelationId);
    expect(setHeaderMock).toHaveBeenCalledWith(
      CORRELATION_ID_HEADER,
      clientCorrelationId,
    );
    expect(capturedContextId).toBe(clientCorrelationId);
  });
});
