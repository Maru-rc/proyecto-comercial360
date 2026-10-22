import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteOrmEntity } from '../../../../clients/infrastructure/persistence/entities/cliente.orm-entity.js';
import { CotizacionOrmEntity } from './cotizacion.orm-entity.js';

@Entity('pedido')
export class PedidoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_pedido' })
  id: number;

  @Column({ name: 'numero', unique: true, length: 50 })
  orderNumber: string;

  @ManyToOne(() => ClienteOrmEntity)
  @JoinColumn({ name: 'id_cliente' })
  customer: ClienteOrmEntity;

  @ManyToOne(() => CotizacionOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_cotizacion' })
  quote: CotizacionOrmEntity | null;

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

  @Column({ name: 'estado', length: 30, default: 'CERRADO' })
  status: string;

  @Column({ name: 'fecha_entrega_estimada', type: 'date', nullable: true })
  estimatedDeliveryDate: Date | null;
}
