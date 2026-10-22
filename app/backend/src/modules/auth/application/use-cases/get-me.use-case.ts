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
 * Builds the profile of the authenticated user (GET /api/me).
 *
 * The session is already valid at this point (otherwise AuthGuard returned 401),
 * so this use case always returns 200. The `asesor` block is included only when
 * a matching record exists in the `asesor` table (linked by email).
 *
 * An ASESOR user with no `asesor` record is a data inconsistency: we return 403
 * (via DomainErrorsFilter) because the frontend cannot build the asesor scope.
 * A DIRECTOR never has an asesor record, so their `asesor` field is always null.
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

    // Directors never have an asesor record
    if (user.role === 'DIRECTOR') {
      return { ...base, asesor: null };
    }

    // Link asesor by email: user.email = asesor.correo
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
