import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteOrmEntity } from './cliente.orm-entity.js';

// Composite index for faster history queries
@Index(['customerId', 'date'])
@Entity('historial_cliente')
export class HistorialClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_historial' })
  id: number;

  @ManyToOne(() => ClienteOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  customer: ClienteOrmEntity;

  // Redundant column for the composite index
  @Column({ name: 'id_cliente', insert: false, update: false })
  customerId: number;

  @CreateDateColumn({ name: 'fecha' })
  date: Date;

  @Column({ name: 'accion', length: 100 })
  action: string;

  @Column({ name: 'usuario', length: 150 })
  user: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
