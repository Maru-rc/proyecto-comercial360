import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../domain/role.js';
import type { RequestWithUser } from './auth.guard.js';
import { ROLES_KEY } from './roles.decorator.js';

/** Se ejecuta después de AuthGuard. Rol no permitido: 403. */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // Sin @Roles, basta con estar autenticado
    if (!roles || roles.length === 0) return true;

    const user = context.switchToHttp().getRequest<RequestWithUser>().authUser;
    if (!user) throw new UnauthorizedException('Sesión no válida');
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('No tienes permisos para esta operación');
    }
    return true;
  }
}
