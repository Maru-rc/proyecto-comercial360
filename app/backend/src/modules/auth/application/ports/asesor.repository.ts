export interface AsesorRecord {
  idAsesor: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  estado: string;
}

/** Port: how the application queries asesores (implementation uses TypeORM). */
export interface AsesorRepository {
  /** Finds the asesor whose email matches (case-insensitive). */
  findByEmail(email: string): Promise<AsesorRecord | null>;
}

export const ASESOR_REPOSITORY = Symbol('ASESOR_REPOSITORY');
