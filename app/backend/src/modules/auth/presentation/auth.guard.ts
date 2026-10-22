import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import type { Request } from 'express';
import { AuthenticatedUser } from '../domain/authenticated-user.js';
import { isRole } from '../domain/role.js';
import { AUTH } from '../infrastructure/better-auth/auth.factory.js';
import type { Auth } from '../infrastructure/better-auth/auth.factory.js';

export type RequestWithUser = Request & { authUser?: AuthenticatedUser };

/**
 * Exige una sesión válida de Better Auth (cookie). Si no hay sesión: 401.
 * Deja el usuario en `request.authUser`; el rol sale de la base de datos,
 * nunca de lo que envíe el cliente.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(AUTH) private readonly auth: Auth) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const session = await this.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });
    if (!session) throw new UnauthorizedException('Sesión no válida');

    const { id, name, email, role } = session.user;
    // Si en la base hubiera un rol desconocido, se niega el acceso
    if (!isRole(role)) throw new ForbiddenException('Rol no válido');

    request.authUser = { id, name, email, role };
    return true;
  }
}
