import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  AdvisorOutOfScopeError,
  UnlinkedAdvisorError,
} from '../domain/auth.errors.js';

/** Converts domain authorization errors into HTTP 403 Forbidden. */
@Catch(UnlinkedAdvisorError, AdvisorOutOfScopeError)
export class DomainErrorsFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    host
      .switchToHttp()
      .getResponse<Response>()
      .status(HttpStatus.FORBIDDEN)
      .json({
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        message: error.message,
      });
  }
}
