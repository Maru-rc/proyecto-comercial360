import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_statuses')
export class CustomerStatusOrmEntity {
  @PrimaryGeneratedColumn({ name: 'customer_status_id' })
  id: number;

  @Column({ name: 'name', length: 100, unique: true })
  name: string;
}
