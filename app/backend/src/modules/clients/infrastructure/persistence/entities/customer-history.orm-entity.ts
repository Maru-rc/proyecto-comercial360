import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerOrmEntity } from './customer.orm-entity.js';

@Index(['customerId', 'date'])
@Entity('customer_history')
export class CustomerHistoryOrmEntity {
  @PrimaryGeneratedColumn({ name: 'customer_history_id' })
  id: number;

  @ManyToOne(() => CustomerOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerOrmEntity;

  @Column({ name: 'customer_id' })
  customerId: number;

  @CreateDateColumn({ name: 'date' })
  date: Date;

  @Column({ name: 'action', length: 100 })
  action: string;

  @Column({ name: 'user', length: 150 })
  user: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;
}
