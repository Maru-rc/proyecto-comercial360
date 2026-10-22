import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

// Controlador de ejemplo para leer los metadatos de @Roles
class Ejemplo {
  @Roles('DIRECTOR')
  soloDirector() {}
  abierto() {}
}

function contexto(
  metodo: 'soloDirector' | 'abierto',
  role?: 'ASESOR' | 'DIRECTOR',
) {
  return {
    getHandler: () => Ejemplo.prototype[metodo],
    getClass: () => Ejemplo,
    switchToHttp: () => ({
      getRequest: () => ({
        authUser: role ? { id: '1', name: 'n', email: 'e', role } : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('8. el asesor recibe 403 en una operación de director', () => {
    expect(() => guard.canActivate(contexto('soloDirector', 'ASESOR'))).toThrow(
      ForbiddenException,
    );
  });

  it('7. el director pasa', () => {
    expect(guard.canActivate(contexto('soloDirector', 'DIRECTOR'))).toBe(true);
  });

  it('sin @Roles basta con estar autenticado', () => {
    expect(guard.canActivate(contexto('abierto', 'ASESOR'))).toBe(true);
  });

  it('sin usuario autenticado responde 401', () => {
    expect(() => guard.canActivate(contexto('soloDirector'))).toThrow(
      UnauthorizedException,
    );
  });
});
