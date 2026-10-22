import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('asesor')
export class AsesorOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_asesor' })
  id: number;

  @Column({ name: 'nombre', length: 150 })
  name: string;

  @Column({ name: 'correo', length: 150, unique: true })
  email: string;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  // 'ACTIVO' | 'INACTIVO'
  @Column({ name: 'estado', length: 20, default: 'ACTIVO' })
  status: string;
}
