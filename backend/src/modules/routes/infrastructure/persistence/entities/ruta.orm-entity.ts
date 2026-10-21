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
  idRuta: number;

  @Column({ length: 200 })
  nombre: string;

  @ManyToOne(() => AsesorOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_asesor' })
  asesor: AsesorOrmEntity | null;

  @ManyToOne(() => ZonaOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_zona' })
  zona: ZonaOrmEntity | null;

  @Column({ name: 'fecha_inicio', type: 'date', nullable: true })
  fechaInicio: Date | null;

  @Column({ name: 'fecha_fin', type: 'date', nullable: true })
  fechaFin: Date | null;

  @Column({ length: 30, default: 'BORRADOR' })
  estado: string;

  @Column({ name: 'dia_ejecucion', length: 20, nullable: true })
  diaEjecucion: string | null;

  @Column({ length: 20, nullable: true })
  frecuencia: string | null;

  @Column({ name: 'hora_inicio', type: 'time', nullable: true })
  horaInicio: string | null;

  @Column({ name: 'hora_fin', type: 'time', nullable: true })
  horaFin: string | null;

  @Column({ length: 200, nullable: true })
  descripcion: string | null;

  @OneToMany(() => RutaClienteOrmEntity, (rc) => rc.ruta)
  paradas: RutaClienteOrmEntity[];
}
