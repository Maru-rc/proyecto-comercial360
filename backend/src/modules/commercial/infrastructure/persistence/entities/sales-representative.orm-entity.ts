import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sales_representatives')
export class SalesRepresentativeOrmEntity {
  @PrimaryGeneratedColumn({ name: 'sales_representative_id' })
  id: number;

  @Column({ name: 'name', length: 150 })
  name: string;

  @Column({ name: 'email', length: 150, unique: true })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  // 'ACTIVO' | 'INACTIVO'
  @Column({ name: 'status', length: 20, default: 'ACTIVO' })
  status: string;
}
