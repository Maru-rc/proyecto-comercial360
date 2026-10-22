import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerOrmEntity } from '../../../../clients/infrastructure/persistence/entities/customer.orm-entity.js';
import { QuoteOrmEntity } from './quote.orm-entity.js';

@Entity('orders')
export class OrderOrmEntity {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  id: number;

  @Column({ name: 'order_number', unique: true, length: 50 })
  orderNumber: string;

  @ManyToOne(() => CustomerOrmEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerOrmEntity;

  @ManyToOne(() => QuoteOrmEntity, { nullable: true })
  @JoinColumn({ name: 'quote_id' })
  quote: QuoteOrmEntity | null;

  @Column({ name: 'date', type: 'date' })
  date: Date;

  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  amount: number;

  @Column({ name: 'status', length: 30, default: 'CERRADO' })
  status: string;

  @Column({ name: 'estimated_delivery_date', type: 'date', nullable: true })
  estimatedDeliveryDate: Date | null;
}
