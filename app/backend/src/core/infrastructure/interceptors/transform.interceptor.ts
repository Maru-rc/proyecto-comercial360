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

export const SLOW_REQUEST_THRESHOLD_MS = 500;

export const INTERCEPTOR_CONSTANTS = {
  DEFAULT_HTTP_METHOD: 'REQ',
  DEFAULT_TRACE_ID: 'no-trace',
  DEFAULT_STATUS_CODE: 200,
  SWAGGER_DOCS_PATH_PREFIX: '/api/docs',
  AUTH_PATH_PREFIX: '/api/auth',
} as const;

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

        const standardMetadata = this.buildStandardMetadata(
          httpResponse,
          httpRequest,
          fallbackStartTime,
        );

        return this.wrapExecutionResult(executionResult, standardMetadata);
      }),
    );
  }

  private buildStandardMetadata(
    httpResponse: Response | undefined,
    httpRequest: RequestWithCorrelation | undefined,
    fallbackStartTime: number,
  ): ApiResponseMeta {
    const httpStatusCode =
      httpResponse?.statusCode || INTERCEPTOR_CONSTANTS.DEFAULT_STATUS_CODE;
    const requestTimestamp = new Date().toISOString();
    const requestPath = httpRequest?.url || '';
    const initialRequestStartTime = httpRequest?.startTime || fallbackStartTime;
    const executionDurationMs = Date.now() - initialRequestStartTime;
    const correlationId =
      CorrelationContext.getCorrelationId() || httpRequest?.correlationId;

    this.logSlowRequestIfNeeded(
      httpRequest,
      requestPath,
      executionDurationMs,
      correlationId,
    );

    return {
      statusCode: httpStatusCode,
      timestamp: requestTimestamp,
      path: requestPath,
      ...(correlationId ? { correlationId } : {}),
      durationMs: executionDurationMs,
    };
  }

  private logSlowRequestIfNeeded(
    httpRequest: RequestWithCorrelation | undefined,
    requestPath: string,
    executionDurationMs: number,
    correlationId?: string,
  ): void {
    if (executionDurationMs > SLOW_REQUEST_THRESHOLD_MS) {
      const httpMethod =
        httpRequest?.method || INTERCEPTOR_CONSTANTS.DEFAULT_HTTP_METHOD;
      const traceId = correlationId || INTERCEPTOR_CONSTANTS.DEFAULT_TRACE_ID;
      this.interceptorLogger.warn(
        `⚠️ Slow Request: ${httpMethod} ${requestPath} - ${executionDurationMs}ms [${traceId}]`,
      );
    }
  }

  private wrapExecutionResult(
    executionResult: unknown,
    standardMetadata: ApiResponseMeta,
  ): ApiResponseEnvelope<T> {
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
      requestUrl.startsWith(INTERCEPTOR_CONSTANTS.SWAGGER_DOCS_PATH_PREFIX) ||
      requestUrl.startsWith(INTERCEPTOR_CONSTANTS.AUTH_PATH_PREFIX)
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
