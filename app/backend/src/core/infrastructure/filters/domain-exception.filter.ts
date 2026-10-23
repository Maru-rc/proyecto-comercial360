import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CorrelationContext } from '../correlation/correlation-context.js';
import type { RequestWithCorrelation } from '../correlation/correlation-id.middleware.js';
import {
  DomainException,
  EntityNotFoundException,
  ForbiddenOperationException,
  InvalidOperationException,
  ResourceConflictException,
  UnauthorizedOperationException,
} from '../../../domain-contracts/index.js';

export interface DomainErrorResponseBody {
  statusCode: number;
  error: string;
  code: string;
  message: string;
  details: unknown;
  timestamp: string;
  path: string;
  correlationId?: string;
}

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter<DomainException> {
  private readonly filterLogger = new Logger(DomainExceptionFilter.name);

  catch(exception: DomainException, host: ArgumentsHost): void {
    const httpContext = host.switchToHttp();
    const httpResponse = httpContext.getResponse<Response>();
    const httpRequest = httpContext.getRequest<Request>();

    const httpStatusCode = this.resolveHttpStatusCode(exception);
    const requestPath = httpRequest?.url || '';
    const correlationId =
      CorrelationContext.getCorrelationId() ||
      (httpRequest as RequestWithCorrelation)?.correlationId;

    const errorResponseBody: DomainErrorResponseBody = {
      statusCode: httpStatusCode,
      error: exception.name,
      code: exception.code,
      message: exception.message,
      details: exception.details ?? null,
      timestamp: new Date().toISOString(),
      path: requestPath,
      ...(correlationId ? { correlationId } : {}),
    };

    this.logDispatchedError(
      httpStatusCode,
      exception,
      requestPath,
      correlationId,
    );

    httpResponse.status(httpStatusCode).json(errorResponseBody);
  }

  private resolveHttpStatusCode(exception: DomainException): number {
    if (exception instanceof EntityNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof ResourceConflictException) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof ForbiddenOperationException) {
      return HttpStatus.FORBIDDEN;
    }
    if (exception instanceof UnauthorizedOperationException) {
      return HttpStatus.UNAUTHORIZED;
    }
    if (exception instanceof InvalidOperationException) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.BAD_REQUEST;
  }

  private logDispatchedError(
    statusCode: number,
    exception: DomainException,
    requestPath: string,
    correlationId?: string,
  ): void {
    const traceSuffix = correlationId ? ` [${correlationId}]` : '';
    const logMessage = `[${statusCode}] ${requestPath} - ${exception.name}: ${exception.message}${traceSuffix}`;
    if (statusCode >= 500) {
      this.filterLogger.error(logMessage, exception.stack);
    } else {
      this.filterLogger.warn(logMessage);
    }
  }
}
