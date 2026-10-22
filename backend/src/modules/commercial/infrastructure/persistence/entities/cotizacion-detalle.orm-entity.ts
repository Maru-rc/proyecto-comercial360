import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CotizacionOrmEntity } from './cotizacion.orm-entity.js';

@Entity('cotizacion_detalle')
export class CotizacionDetalleOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_detalle' })
  id: number;

  @ManyToOne(() => CotizacionOrmEntity, (quote) => quote.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cotizacion' })
  quote: Relation<CotizacionOrmEntity>;

  @Column({ name: 'producto', length: 200 })
  product: string;

  @Column({ name: 'cantidad', type: 'int' })
  quantity: number;

  @Column({ name: 'precio', type: 'decimal', precision: 15, scale: 2 })
  unitPrice: number;

  @Column({ name: 'subtotal', type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;
}
