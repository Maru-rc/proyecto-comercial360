import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteOrmEntity } from '../../../../clients/infrastructure/persistence/entities/cliente.orm-entity.js';
import { AsesorOrmEntity } from './asesor.orm-entity.js';
import { CotizacionDetalleOrmEntity } from './cotizacion-detalle.orm-entity.js';

@Entity('cotizacion')
export class CotizacionOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_cotizacion' })
  id: number;

  @Column({ name: 'numero', unique: true, length: 50 })
  quoteNumber: string;

  @ManyToOne(() => ClienteOrmEntity)
  @JoinColumn({ name: 'id_cliente' })
  customer: ClienteOrmEntity;

  @ManyToOne(() => AsesorOrmEntity)
  @JoinColumn({ name: 'id_asesor' })
  salesRepresentative: AsesorOrmEntity;

  @Column({ name: 'fecha', type: 'date' })
  date: Date;

  @Column({
    name: 'valor',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  amount: number;

  @Column({ name: 'estado', length: 30, default: 'ENVIADA' })
  status: string;

  @Column({ name: 'moneda', length: 10, default: 'COP' })
  currency: string;

  @OneToMany(() => CotizacionDetalleOrmEntity, (detail) => detail.quote)
  details: CotizacionDetalleOrmEntity[];
}
