import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('visit_results')
export class VisitOutcomeOrmEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'visit_result_id' })
  id: number;

  @Column({ type: 'int', name: 'visit_id' })
  visitId: number;

  @Column({ type: 'int', nullable: true, name: 'visit_outcome_id' })
  outcomeId: number | null;

  @Column({ type: 'text', nullable: true, name: 'observation' })
  observations: string | null;

  // Domain mapped / joined fields
  outcome?: string;
  reasonNoSale?: string | null;
  evidenceS3Key?: string | null;
  createdAt?: Date;
}
