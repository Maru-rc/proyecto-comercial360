import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VisitaOrmEntity } from './visita.orm-entity.js';
import { AsesorOrmEntity } from '../../../../commercial/infrastructure/persistence/entities/asesor.orm-entity.js';

@Entity('seguimiento')
export class SeguimientoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_seguimiento' })
  idSeguimiento: number;

  @ManyToOne(() => VisitaOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_visita' })
  visita: VisitaOrmEntity;

  @Column({ name: 'fecha_proxima', type: 'timestamp' })
  fechaProxima: Date;

  @Column({ length: 200, nullable: true })
  actividad: string | null;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;

  @Column({ default: false })
  completado: boolean;

  @ManyToOne(() => AsesorOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_asesor_responsable' })
  asesorResponsable: AsesorOrmEntity | null;
}
