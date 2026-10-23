import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { QuoteOrmEntity } from './quote.orm-entity.js';

@Entity('quote_details')
export class QuoteDetailOrmEntity {
  @PrimaryGeneratedColumn({ name: 'quote_detail_id' })
  id: number;

  @ManyToOne(() => QuoteOrmEntity, (quote) => quote.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'quote_id' })
  quote: Relation<QuoteOrmEntity>;

  @Column({ name: 'product', length: 200 })
  product: string;

  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ name: 'subtotal', type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;
}
