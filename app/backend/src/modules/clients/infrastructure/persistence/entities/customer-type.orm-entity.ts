import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_types')
export class CustomerTypeOrmEntity {
  @PrimaryGeneratedColumn({ name: 'customer_type_id' })
  id: number;

  @Column({ name: 'name', length: 100, unique: true })
  name: string;
}
