import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ZoneOrmEntity } from './zone.orm-entity.js';
import { CustomerTypeOrmEntity } from './customer-type.orm-entity.js';
import { PotentialOrmEntity } from './potential.orm-entity.js';
import { CustomerStatusOrmEntity } from './customer-status.orm-entity.js';
import { CustomerContactOrmEntity } from './customer-contact.orm-entity.js';
import { CustomerPortfolioOrmEntity } from './customer-portfolio.orm-entity.js';

@Entity('customers')
export class CustomerOrmEntity {
  @PrimaryGeneratedColumn({ name: 'customer_id' })
  id: number;

  @Column({ name: 'tax_id', unique: true, length: 20 })
  taxId: string;

  @Column({ name: 'legal_name', length: 200 })
  legalName: string;

  @Column({
    name: 'commercial_name',
    type: 'varchar',
    length: 200,
    nullable: true,
  })
  commercialName: string | null;

  @Column({ name: 'address', type: 'varchar', length: 300, nullable: true })
  address: string | null;

  @Column({
    name: 'department',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  department: string | null;

  @Column({
    name: 'municipality',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  municipality: string | null;

  @Column({
    name: 'neighborhood',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  neighborhood: string | null;

  @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({
    name: 'latitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  latitude: number | null;

  @Column({
    name: 'longitude',
    type: 'decimal',
    precision: 10,
    scale: 7,
    nullable: true,
  })
  longitude: number | null;

  @Column({ name: 'visit_frequency_days', type: 'int', nullable: true })
  visitFrequencyDays: number | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // Catalog relationships
  @ManyToOne(() => ZoneOrmEntity, { nullable: true })
  @JoinColumn({ name: 'zone_id' })
  zone: ZoneOrmEntity | null;

  @ManyToOne(() => CustomerTypeOrmEntity, { nullable: true })
  @JoinColumn({ name: 'customer_type_id' })
  customerType: CustomerTypeOrmEntity | null;

  @ManyToOne(() => PotentialOrmEntity, { nullable: true })
  @JoinColumn({ name: 'potential_id' })
  customerPotential: PotentialOrmEntity | null;

  @ManyToOne(() => CustomerStatusOrmEntity, { nullable: true })
  @JoinColumn({ name: 'customer_status_id' })
  customerStatus: CustomerStatusOrmEntity | null;

  @OneToMany(() => CustomerContactOrmEntity, (contact) => contact.customer)
  contacts: CustomerContactOrmEntity[];

  @OneToMany(
    () => CustomerPortfolioOrmEntity,
    (customerPortfolio) => customerPortfolio.customer,
  )
  portfolios: CustomerPortfolioOrmEntity[];
}
