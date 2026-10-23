import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../domain/authenticated-user.js';
import {
  AsesorFueraDeAlcanceError,
  AsesorNoVinculadoError,
} from '../../domain/auth.errors.js';
import { ASESOR_REPOSITORY } from '../ports/asesor.repository.js';
import type { AsesorRepository } from '../ports/asesor.repository.js';

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
