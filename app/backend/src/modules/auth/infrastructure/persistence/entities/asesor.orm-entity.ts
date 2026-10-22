import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * ORM entity for the ASESOR table.
 * Only contains the columns defined in the requirements. Relations with other
 * tables (routes, visits…) will be added in their own stories.
 */
@Entity({ name: 'asesor' })
export class AsesorOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_asesor' })
  idAsesor: number;

  @Column({ type: 'varchar', length: 150 })
  nombre: string;

  // Link to the Better Auth user: user.email = asesor.correo
  @Column({ type: 'varchar', length: 150 })
  correo: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 20, default: 'ACTIVO' })
  estado: string;
}
