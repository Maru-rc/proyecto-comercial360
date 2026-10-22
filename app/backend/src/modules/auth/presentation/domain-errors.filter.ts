import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import type { Response } from 'express';
import {
  AsesorFueraDeAlcanceError,
  AsesorNoVinculadoError,
} from '../domain/auth.errors.js';

/** Convierte los errores de autorización del dominio en 403 Forbidden. */
@Catch(AsesorNoVinculadoError, AsesorFueraDeAlcanceError)
export class DomainErrorsFilter implements ExceptionFilter {
  catch(error: Error, host: ArgumentsHost) {
    host.switchToHttp().getResponse<Response>().status(403).json({
      statusCode: 403,
      error: 'Forbidden',
      message: error.message,
    });
  }
}
