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
  id: number;

  @ManyToOne(() => VisitaOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_visita' })
  visit: VisitaOrmEntity;

  @Column({ name: 'fecha_proxima', type: 'timestamp' })
  nextDate: Date;

  @Column({ name: 'actividad', type: 'varchar', length: 200, nullable: true })
  activity: string | null;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observation: string | null;

  @Column({ name: 'completado', default: false })
  isCompleted: boolean;

  @ManyToOne(() => AsesorOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_asesor_responsable' })
  responsibleSalesRepresentative: AsesorOrmEntity | null;
}
