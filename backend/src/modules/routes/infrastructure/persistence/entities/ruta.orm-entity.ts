import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AsesorOrmEntity } from '../../../../commercial/infrastructure/persistence/entities/asesor.orm-entity.js';
import { ZonaOrmEntity } from '../../../../clients/infrastructure/persistence/entities/zona.orm-entity.js';
import { RutaClienteOrmEntity } from './ruta-cliente.orm-entity.js';

@Entity('ruta')
export class RutaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_ruta' })
  id: number;

  @Column({ name: 'nombre', length: 200 })
  name: string;

  @ManyToOne(() => AsesorOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_asesor' })
  salesRepresentative: AsesorOrmEntity | null;

  @ManyToOne(() => ZonaOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_zona' })
  zone: ZonaOrmEntity | null;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'estado', length: 30, default: 'BORRADOR' })
  status: string;

  @Column({
    name: 'dia_ejecucion',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  executionDay: string | null;

  @Column({ name: 'frecuencia', type: 'varchar', length: 20, nullable: true })
  frequency: string | null;

  @Column({ name: 'hora_inicio', type: 'time', nullable: true })
  startTime: string | null;

  @Column({ name: 'hora_fin', type: 'time', nullable: true })
  endTime: string | null;

  @Column({ name: 'descripcion', type: 'varchar', length: 200, nullable: true })
  description: string | null;

  @OneToMany(() => RutaClienteOrmEntity, (routeStop) => routeStop.route)
  stops: RutaClienteOrmEntity[];
}
