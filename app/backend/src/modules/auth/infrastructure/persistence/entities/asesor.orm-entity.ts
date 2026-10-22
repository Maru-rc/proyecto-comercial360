import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad ORM de la tabla ASESOR.
 * Solo contiene las columnas definidas en los requisitos; las relaciones con
 * otras tablas (rutas, visitas...) se agregarán en sus propias historias.
 */
@Entity({ name: 'asesor' })
export class AsesorOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_asesor' })
  idAsesor: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  // Es el vínculo con el usuario de Better Auth: user.email = asesor.correo
  @Column({ type: 'varchar', length: 150 })
  correo: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado: string;
}
