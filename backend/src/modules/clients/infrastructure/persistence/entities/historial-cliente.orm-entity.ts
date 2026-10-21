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

// Índice compuesto para que las consultas de historial sean rápidas
@Index(['idCliente', 'fecha'])
@Entity('historial_cliente')
export class HistorialClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_historial' })
  idHistorial: number;

  @ManyToOne(() => ClienteOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteOrmEntity;

  // Columna redundante para el índice compuesto
  @Column({ name: 'id_cliente', insert: false, update: false })
  idCliente: number;

  @CreateDateColumn()
  fecha: Date;

  @Column({ length: 100 })
  accion: string;

  @Column({ length: 150 })
  usuario: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;
}
