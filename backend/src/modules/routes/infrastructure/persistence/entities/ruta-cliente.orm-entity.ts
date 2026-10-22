import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { RutaOrmEntity } from './ruta.orm-entity.js';
import { ClienteOrmEntity } from '../../../../clients/infrastructure/persistence/entities/cliente.orm-entity.js';

@Entity('ruta_cliente')
export class RutaClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_ruta_cliente' })
  id: number;

  @ManyToOne(() => RutaOrmEntity, (route) => route.stops, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_ruta' })
  route: Relation<RutaOrmEntity>;

  @ManyToOne(() => ClienteOrmEntity)
  @JoinColumn({ name: 'id_cliente' })
  customer: ClienteOrmEntity;

  @Column({ name: 'orden_visita', type: 'int' })
  visitOrder: number;

  @Column({ name: 'hora_sugerida', type: 'time', nullable: true })
  suggestedTime: string | null;
}
