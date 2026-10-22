import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('asesor')
export class AsesorOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_asesor' })
  idAsesor: number;

  @Column({ length: 150 })
  nombre: string;

  @Column({ length: 150, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  // 'ACTIVO' | 'INACTIVO'
  @Column({ length: 20, default: 'ACTIVO' })
  estado: string;
}
