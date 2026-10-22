import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Entidad ORM de la tabla SALES_REPRESENTATIVES (el asesor comercial).
 * Solo contiene las columnas definidas en los requisitos; las relaciones con
 * otras tablas (rutas, visitas...) se agregarán en sus propias historias.
 */
@Entity({ name: 'sales_representatives' })
export class AsesorOrmEntity {
  @PrimaryGeneratedColumn({ name: 'sales_representative_id' })
  idAsesor: number;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  nombre: string;

  // Es el vínculo con el usuario de Better Auth:
  // user.email = sales_representatives.email
  @Column({ name: 'email', type: 'varchar', length: 150 })
  correo: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'ACTIVO' })
  estado: string;
}
