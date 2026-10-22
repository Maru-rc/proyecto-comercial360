import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../domain/authenticated-user.js';
import {
  AsesorFueraDeAlcanceError,
  AsesorNoVinculadoError,
} from '../../domain/auth.errors.js';
import { ASESOR_REPOSITORY } from '../ports/asesor.repository.js';
import type { AsesorRepository } from '../ports/asesor.repository.js';

/**
 * Anti-IDOR rule for commercial modules (visits, agenda, KPIs…).
 *
 * - ASESOR: the id is ALWAYS resolved from the database using their email.
 *   If the client sends a different asesor id, the request is rejected (403).
 * - DIRECTOR: can query any asesor; if none is requested, returns null
 *   (no filter — all asesores).
 */
@Injectable()
export class ResolveAsesorScopeUseCase {
  constructor(
    @Inject(ASESOR_REPOSITORY) private readonly asesores: AsesorRepository,
  ) {}

  async execute(
    user: AuthenticatedUser,
    requestedAsesorId?: number,
  ): Promise<number | null> {
    if (user.role === 'DIRECTOR') return requestedAsesorId ?? null;

    const own = await this.asesores.findByEmail(user.email);
    if (!own) throw new AsesorNoVinculadoError(user.email);

    if (requestedAsesorId !== undefined && requestedAsesorId !== own.idAsesor) {
      throw new AsesorFueraDeAlcanceError();
    }
    return own.idAsesor;
  }
}
