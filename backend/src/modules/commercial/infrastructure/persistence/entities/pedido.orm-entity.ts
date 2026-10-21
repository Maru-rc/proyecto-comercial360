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
  idPedido: number;

  @Column({ unique: true, length: 50 })
  numero: string;

  @ManyToOne(() => ClienteOrmEntity)
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteOrmEntity;

  @ManyToOne(() => CotizacionOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_cotizacion' })
  cotizacion: CotizacionOrmEntity | null;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valor: number;

  @Column({ length: 30, default: 'CERRADO' })
  estado: string;

  @Column({ name: 'fecha_entrega_estimada', type: 'date', nullable: true })
  fechaEntregaEstimada: Date | null;
}
