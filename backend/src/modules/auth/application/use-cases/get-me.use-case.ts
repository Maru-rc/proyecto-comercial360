import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../domain/authenticated-user.js';
import { AsesorNoVinculadoError } from '../../domain/auth.errors.js';
import { Role } from '../../domain/role.js';
import { ASESOR_REPOSITORY } from '../ports/asesor.repository.js';
import type { AsesorRepository } from '../ports/asesor.repository.js';

export interface MeResult {
  id: string;
  nombre: string;
  email: string;
  rol: Role;
  asesor: { id_asesor: number; telefono: string | null; estado: string } | null;
}

/**
 * Arma el perfil del usuario autenticado (GET /api/me).
 *
 * La sesión ya es válida (si no, el AuthGuard respondió 401), así que el
 * endpoint responde 200 con los datos del usuario. El bloque `asesor` solo
 * se incluye cuando existe el registro en la tabla `asesor` vinculado por
 * correo (`user.email = asesor.correo`).
 *
 * Un usuario con rol ASESOR sin registro en `asesor` es una inconsistencia de
 * datos: se responde 403 (ver DomainErrorsFilter) porque el frontend no
 * puede construir el alcance del asesor. El DIRECTOR nunca tiene registro de
 * asesor y por eso su `asesor` va en null.
 */
@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(ASESOR_REPOSITORY) private readonly asesores: AsesorRepository,
  ) {}

  async execute(user: AuthenticatedUser): Promise<MeResult> {
    const base = {
      id: user.id,
      nombre: user.name,
      email: user.email,
      rol: user.role,
    };

    // El director no tiene registro de asesor
    if (user.role === 'DIRECTOR') {
      return { ...base, asesor: null };
    }

    // El asesor se vincula por correo: user.email = asesor.correo
    const asesor = await this.asesores.findByEmail(user.email);
    if (!asesor) throw new AsesorNoVinculadoError(user.email);

    return {
      ...base,
      asesor: {
        id_asesor: asesor.idAsesor,
        telefono: asesor.telefono,
        estado: asesor.estado,
      },
    };
  }
}
