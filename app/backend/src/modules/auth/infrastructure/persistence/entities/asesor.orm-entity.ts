import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sales_representatives' })
export class AsesorOrmEntity {
  @PrimaryGeneratedColumn({ name: 'sales_representative_id' })
  idAsesor: number;

  @Column({ name: 'name', type: 'varchar', length: 150 })
  nombre: string;

  @Column({ name: 'email', type: 'varchar', length: 150 })
  correo: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'ACTIVO' })
  estado: string;
}
