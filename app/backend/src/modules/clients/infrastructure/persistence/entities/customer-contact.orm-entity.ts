import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CustomerOrmEntity } from './customer.orm-entity.js';

@Entity('customer_contacts')
export class CustomerContactOrmEntity {
  @PrimaryGeneratedColumn({ name: 'contact_id' })
  id: number;

  @ManyToOne(() => CustomerOrmEntity, (customer) => customer.contacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<CustomerOrmEntity>;

  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customerId: number | null;

  @Column({ name: 'name', length: 150 })
  name: string;

  @Column({ name: 'position', type: 'varchar', length: 100, nullable: true })
  position: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'mobile_phone', type: 'varchar', length: 20, nullable: true })
  mobilePhone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;
}
