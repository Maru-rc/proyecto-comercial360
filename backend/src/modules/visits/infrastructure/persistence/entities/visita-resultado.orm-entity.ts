import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { VisitaOrmEntity } from './visita.orm-entity.js';
import { ResultadoVisitaOrmEntity } from './resultado-visita.orm-entity.js';

@Entity('visita_resultado')
export class VisitaResultadoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_visita_resultado' })
  id: number;

  @ManyToOne(() => VisitaOrmEntity, (visit) => visit.outcomes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_visita' })
  visit: Relation<VisitaOrmEntity>;

  @ManyToOne(() => ResultadoVisitaOrmEntity)
  @JoinColumn({ name: 'id_resultado' })
  outcome: ResultadoVisitaOrmEntity;

  @Column({ name: 'observacion', type: 'text', nullable: true })
  observation: string | null;
}
