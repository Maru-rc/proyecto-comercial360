import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { VisitOrmEntity } from './visit.orm-entity.js';
import { VisitOutcomeOrmEntity } from './visit-outcome.orm-entity.js';

@Entity('visit_results')
export class VisitResultOrmEntity {
  @PrimaryGeneratedColumn({ name: 'visit_result_id' })
  id: number;

  @ManyToOne(() => VisitOrmEntity, (visit) => visit.outcomes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'visit_id' })
  visit: Relation<VisitOrmEntity>;

  @ManyToOne(() => VisitOutcomeOrmEntity)
  @JoinColumn({ name: 'visit_outcome_id' })
  outcome: VisitOutcomeOrmEntity;

  @Column({ name: 'observation', type: 'text', nullable: true })
  observation: string | null;
}
