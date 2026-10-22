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
  idRutaCliente: number;

  @ManyToOne(() => RutaOrmEntity, (r) => r.paradas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_ruta' })
  ruta: Relation<RutaOrmEntity>;

  @ManyToOne(() => ClienteOrmEntity)
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteOrmEntity;

  @Column({ name: 'orden_visita', type: 'int' })
  ordenVisita: number;

  @Column({ name: 'hora_sugerida', type: 'time', nullable: true })
  horaSugerida: string | null;
}
