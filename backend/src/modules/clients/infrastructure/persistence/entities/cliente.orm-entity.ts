import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ZonaOrmEntity } from './zona.orm-entity.js';
import { TipoClienteOrmEntity } from './tipo-cliente.orm-entity.js';
import { PotencialOrmEntity } from './potencial.orm-entity.js';
import { EstadoClienteOrmEntity } from './estado-cliente.orm-entity.js';
import { ContactoClienteOrmEntity } from './contacto-cliente.orm-entity.js';
import { ClientePortafolioOrmEntity } from './cliente-portafolio.orm-entity.js';

@Entity('cliente')
export class ClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_cliente' })
  id: number;

  @Column({ name: 'nit', unique: true, length: 20 })
  taxId: string;

  @Column({ name: 'razon_social', length: 200 })
  legalName: string;

  @Column({
    name: 'nombre_comercial',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  commercialName: string | null;

  @Column({ name: 'direccion', type: 'varchar', length: 300, nullable: true })
  address: string | null;

  @Column({
    name: 'departamento',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  department: string | null;

  @Column({ name: 'municipio', type: 'varchar', length: 100, nullable: true })
  municipality: string | null;

  @Column({ name: 'barrio', type: 'varchar', length: 100, nullable: true })
  neighborhood: string | null;

  @Column({ name: 'telefono', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({
    name: 'latitud',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude: number | null;

  @Column({
    name: 'longitud',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude: number | null;

  @Column({ name: 'frecuencia_visita_dias', type: 'int', nullable: true })
  visitFrequencyDays: number | null;

  @CreateDateColumn({ name: 'fecha_creacion' })
  createdAt: Date;

  @Column({ name: 'activo', default: true })
  isActive: boolean;

  // Catalog relationships
  @ManyToOne(() => ZonaOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_zona' })
  zone: ZonaOrmEntity | null;

  @ManyToOne(() => TipoClienteOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_tipo_cliente' })
  customerType: TipoClienteOrmEntity | null;

  @ManyToOne(() => PotencialOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_potencial' })
  customerPotential: PotencialOrmEntity | null;

  @ManyToOne(() => EstadoClienteOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_estado_cliente' })
  customerStatus: EstadoClienteOrmEntity | null;

  @OneToMany(() => ContactoClienteOrmEntity, (contact) => contact.customer)
  contacts: ContactoClienteOrmEntity[];

  @OneToMany(
    () => ClientePortafolioOrmEntity,
    (customerPortfolio) => customerPortfolio.customer,
  )
  portfolios: ClientePortafolioOrmEntity[];
}
