import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ClienteOrmEntity } from './cliente.orm-entity.js';
import { PortafolioOrmEntity } from './portafolio.orm-entity.js';

// Junction table for the many-to-many Customer <-> Portfolio relationship
@Entity('cliente_portafolio')
export class ClientePortafolioOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_cliente_portafolio' })
  id: number;

  @ManyToOne(() => ClienteOrmEntity, (customer) => customer.portfolios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente' })
  customer: Relation<ClienteOrmEntity>;

  @ManyToOne(() => PortafolioOrmEntity)
  @JoinColumn({ name: 'id_portafolio' })
  portfolio: PortafolioOrmEntity;

  @CreateDateColumn({ name: 'fecha_registro' })
  registeredAt: Date;
}
