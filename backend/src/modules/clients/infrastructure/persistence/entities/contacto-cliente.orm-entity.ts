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
  id: number;

  @ManyToOne(() => ClienteOrmEntity, (customer) => customer.contacts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente' })
  customer: Relation<ClienteOrmEntity>;

  @Column({ name: 'nombre', length: 150 })
  name: string;

  @Column({ name: 'cargo', type: 'varchar', length: 100, nullable: true })
  position: string | null;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'celular', type: 'varchar', length: 20, nullable: true })
  mobilePhone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  // Indicates whether this is the customer's primary contact
  @Column({ name: 'principal', default: false })
  isPrimary: boolean;
}
