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
 * Protects an endpoint: requires a valid session and, optionally, specific roles.
 *   @Auth()             → any authenticated user
 *   @Auth('DIRECTOR')   → director only (asesor gets 403)
 */
export const Auth = (...roles: Role[]) =>
  applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard, RolesGuard),
    ApiCookieAuth(),
    ApiUnauthorizedResponse({ description: 'No valid session found' }),
    ApiForbiddenResponse({ description: 'Role does not have permission' }),
  );

/** Injects the authenticated user into a controller method parameter. */
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<RequestWithUser>().authUser,
);
