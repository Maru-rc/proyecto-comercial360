import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'node:crypto';
import { CorrelationContext } from './correlation-context.js';

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

export interface RequestWithCorrelation extends Request {
  correlationId?: string;
  startTime?: number;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(
    httpRequest: RequestWithCorrelation,
    httpResponse: Response,
    nextFunction: NextFunction,
  ): void {
    const rawHeaderValue =
      httpRequest.headers[CORRELATION_ID_HEADER] ||
      httpRequest.headers[REQUEST_ID_HEADER];

    const correlationId =
      typeof rawHeaderValue === 'string' && rawHeaderValue.trim().length > 0
        ? rawHeaderValue.trim()
        : randomUUID();

    httpRequest.correlationId = correlationId;
    httpRequest.startTime = Date.now();

    httpResponse.setHeader(CORRELATION_ID_HEADER, correlationId);

    CorrelationContext.run(correlationId, () => {
      nextFunction();
    });
  }
}
