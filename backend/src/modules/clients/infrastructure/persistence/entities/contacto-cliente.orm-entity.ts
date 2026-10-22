import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { ClienteOrmEntity } from './cliente.orm-entity.js';

@Entity('contacto_cliente')
export class ContactoClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_contacto' })
  idContacto: number;

  @ManyToOne(() => ClienteOrmEntity, (c) => c.contactos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Relation<ClienteOrmEntity>;

  @Column({ length: 150 })
  nombre: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  cargo: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefono: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  celular: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  // Indica si es el contacto principal del cliente
  @Column({ default: false })
  principal: boolean;
}
