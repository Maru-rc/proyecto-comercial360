import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../domain/authenticated-user.js';
import {
  AsesorFueraDeAlcanceError,
  AsesorNoVinculadoError,
} from '../../domain/auth.errors.js';
import { ASESOR_REPOSITORY } from '../ports/asesor.repository.js';
import type { AsesorRepository } from '../ports/asesor.repository.js';

/**
 * Regla anti-IDOR para los módulos comerciales (visitas, agenda, KPI...).
 *
 * - ASESOR: el id sale SIEMPRE de la base de datos a partir de su correo. Si el
 *   cliente envía otro id de asesor, se rechaza (403).
 * - DIRECTOR: puede consultar a cualquier asesor; si no pide uno, devuelve null
 *   (sin filtro, todos los asesores).
 *
 * PENDIENTE DE INTEGRACIÓN: los controladores de visitas, agenda y KPI aún no
 * tienen endpoints; cuando existan deben llamar a este caso de uso en vez de
 * confiar en un asesorId recibido del cliente.
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
