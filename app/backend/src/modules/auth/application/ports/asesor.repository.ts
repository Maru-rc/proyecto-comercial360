export interface AsesorRecord {
  idAsesor: number;
  nombre: string;
  correo: string;
  telefono: string | null;
  estado: string;
}

/** Puerto: cómo la aplicación consulta asesores (la implementación usa TypeORM). */
export interface AsesorRepository {
  /** Busca el asesor cuyo correo coincide (sin distinguir mayúsculas). */
  findByEmail(email: string): Promise<AsesorRecord | null>;
}

export const ASESOR_REPOSITORY = Symbol('ASESOR_REPOSITORY');
