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
  idCliente: number;

  @Column({ unique: true, length: 20 })
  nit: string;

  @Column({ name: 'razon_social', length: 200 })
  razonSocial: string;

  @Column({ name: 'nombre_comercial', length: 200, nullable: true })
  nombreComercial: string | null;

  @Column({ length: 300, nullable: true })
  direccion: string | null;

  @Column({ length: 100, nullable: true })
  departamento: string | null;

  @Column({ length: 100, nullable: true })
  municipio: string | null;

  @Column({ length: 100, nullable: true })
  barrio: string | null;

  @Column({ length: 20, nullable: true })
  telefono: string | null;

  @Column({ length: 150, nullable: true })
  email: string | null;

  // Coordenadas para el mapa (se llenan con Nominatim)
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitud: number | null;

  @Column({ name: 'frecuencia_visita_dias', type: 'int', nullable: true })
  frecuenciaVisitaDias: number | null;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;

  @Column({ default: true })
  activo: boolean;

  // Relaciones con catálogos
  @ManyToOne(() => ZonaOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_zona' })
  zona: ZonaOrmEntity | null;

  @ManyToOne(() => TipoClienteOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_tipo_cliente' })
  tipoCliente: TipoClienteOrmEntity | null;

  @ManyToOne(() => PotencialOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_potencial' })
  potencial: PotencialOrmEntity | null;

  @ManyToOne(() => EstadoClienteOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_estado_cliente' })
  estadoCliente: EstadoClienteOrmEntity | null;

  @OneToMany(() => ContactoClienteOrmEntity, (c) => c.cliente)
  contactos: ContactoClienteOrmEntity[];

  @OneToMany(() => ClientePortafolioOrmEntity, (cp) => cp.cliente)
  portafolios: ClientePortafolioOrmEntity[];
}
