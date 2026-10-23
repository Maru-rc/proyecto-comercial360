export interface AsesorRecord {
  idAsesor: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  estado: string;
}

export interface AsesorRepository {
  findByEmail(email: string): Promise<AsesorRecord | null>;
}

export const ASESOR_REPOSITORY = Symbol('ASESOR_REPOSITORY');
