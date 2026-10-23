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

    if (user.role === 'DIRECTOR') {
      return { ...base, asesor: null };
    }

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
