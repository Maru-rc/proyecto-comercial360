import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '../domain/role.js';
import { AuthGuard } from './auth.guard.js';
import type { RequestWithUser } from './auth.guard.js';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

/**
 * Protege un endpoint: exige sesión y, opcionalmente, ciertos roles.
 *   @Auth()             -> cualquier usuario autenticado
 *   @Auth('DIRECTOR')   -> solo director (el asesor recibe 403)
 */
export const Auth = (...roles: Role[]) =>
  applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiCookieAuth(),
    ApiUnauthorizedResponse({ description: 'No hay una sesión válida' }),
    ApiForbiddenResponse({ description: 'El rol no tiene permiso' }),
  );

/** Entrega el usuario autenticado al método del controlador. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<RequestWithUser>().authUser,
);
