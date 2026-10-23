import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerOrmEntity } from '../../../../clients/infrastructure/persistence/entities/customer.orm-entity.js';
import { SalesRepresentativeOrmEntity } from './sales-representative.orm-entity.js';
import { QuoteDetailOrmEntity } from './quote-detail.orm-entity.js';

@Entity('quotes')
export class QuoteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'quote_id' })
  id: number;

  @Column({ name: 'quote_number', unique: true, length: 50 })
  quoteNumber: string;

  @ManyToOne(() => CustomerOrmEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerOrmEntity;

  @ManyToOne(() => SalesRepresentativeOrmEntity)
  @JoinColumn({ name: 'sales_representative_id' })
  salesRepresentative: SalesRepresentativeOrmEntity;

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

  @Column({ name: 'status', length: 30, default: 'ENVIADA' })
  status: string;

  @Column({ name: 'currency', length: 10, default: 'COP' })
  currency: string;

  @OneToMany(() => QuoteDetailOrmEntity, (detail) => detail.quote)
  details: QuoteDetailOrmEntity[];
}
