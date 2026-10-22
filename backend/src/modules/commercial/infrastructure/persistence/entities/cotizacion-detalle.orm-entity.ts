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
  idDetalle: number;

  @ManyToOne(() => CotizacionOrmEntity, (c) => c.detalles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cotizacion' })
  cotizacion: Relation<CotizacionOrmEntity>;

  @Column({ length: 200 })
  producto: string;

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  precio: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  subtotal: number;
}
