import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  CatalogoInvalidoError,
  ClienteNoEncontradoError,
  ClienteYaExisteError,
} from '../../domain/client.errors.js';

@Catch(ClienteYaExisteError, ClienteNoEncontradoError, CatalogoInvalidoError)
export class ClientDomainErrorsFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (error instanceof ClienteYaExisteError) {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: error.message,
      });
    }

    if (error instanceof ClienteNoEncontradoError) {
      return response.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: error.message,
      });
    }

    if (error instanceof CatalogoInvalidoError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Bad Request',
        message: error.message,
      });
    }

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: error.message,
    });
  }
}
