import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CorrelationContext } from '../correlation/correlation-context.js';
import type { RequestWithCorrelation } from '../correlation/correlation-id.middleware.js';
import { BYPASS_TRANSFORM_METADATA_KEY } from './bypass-transform.decorator.js';

export interface ApiResponseMeta {
  statusCode: number;
  timestamp: string;
  path: string;
  correlationId?: string;
  durationMs?: number;
  [key: string]: unknown;
}

export interface ApiResponseEnvelope<T> {
  data: T;
  meta: ApiResponseMeta;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponseEnvelope<T> | T
> {
  private readonly interceptorLogger = new Logger(TransformInterceptor.name);

  constructor(private readonly metadataReflector: Reflector) {}

  intercept(
    executionContext: ExecutionContext,
    callHandler: CallHandler,
  ): Observable<ApiResponseEnvelope<T> | T> {
    if (this.shouldBypassTransformation(executionContext)) {
      return callHandler.handle();
    }

    const fallbackStartTime = Date.now();
    const httpContext = executionContext.switchToHttp();
    const httpResponse = httpContext.getResponse<Response>();
    const httpRequest = httpContext.getRequest<RequestWithCorrelation>();

    return callHandler.handle().pipe(
      map((executionResult: unknown) => {
        if (httpResponse?.headersSent) {
          return executionResult as T;
        }

        const httpStatusCode = httpResponse?.statusCode || 200;
        const requestTimestamp = new Date().toISOString();
        const requestPath = httpRequest?.url || '';
        const initialRequestStartTime =
          httpRequest?.startTime || fallbackStartTime;
        const executionDurationMs = Date.now() - initialRequestStartTime;
        const correlationId =
          CorrelationContext.getCorrelationId() || httpRequest?.correlationId;

        if (executionDurationMs > 500) {
          this.interceptorLogger.warn(
            `⚠️ Slow Request: ${httpRequest?.method || 'REQ'} ${requestPath} - ${executionDurationMs}ms [${correlationId || 'no-trace'}]`,
          );
        }

        const standardMetadata: ApiResponseMeta = {
          statusCode: httpStatusCode,
          timestamp: requestTimestamp,
          path: requestPath,
          ...(correlationId ? { correlationId } : {}),
          durationMs: executionDurationMs,
        };

        if (this.isAlreadyEnveloped(executionResult)) {
          const { data: innerPayload, meta: customMetadata } = executionResult;
          return {
            data: innerPayload as T,
            meta: {
              ...standardMetadata,
              ...customMetadata,
            },
          };
        }

        return {
          data: (executionResult === undefined ? null : executionResult) as T,
          meta: standardMetadata,
        };
      }),
    );
  }

  private shouldBypassTransformation(
    executionContext: ExecutionContext,
  ): boolean {
    const isHandlerBypassed = this.metadataReflector.get<boolean>(
      BYPASS_TRANSFORM_METADATA_KEY,
      executionContext.getHandler(),
    );
    if (isHandlerBypassed) return true;

    const isClassBypassed = this.metadataReflector.get<boolean>(
      BYPASS_TRANSFORM_METADATA_KEY,
      executionContext.getClass(),
    );
    if (isClassBypassed) return true;

    const httpRequest = executionContext.switchToHttp().getRequest<Request>();
    const requestUrl = httpRequest?.url || '';

    return (
      requestUrl.startsWith('/api/docs') || requestUrl.startsWith('/api/auth')
    );
  }

  private isAlreadyEnveloped(
    rawResult: unknown,
  ): rawResult is { data: unknown; meta?: Record<string, unknown> } {
    return (
      rawResult !== null &&
      typeof rawResult === 'object' &&
      'data' in (rawResult as Record<string, unknown>)
    );
  }
}
