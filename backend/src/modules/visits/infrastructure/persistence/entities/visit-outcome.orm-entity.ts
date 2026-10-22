import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('visit_outcomes')
export class VisitOutcomeOrmEntity {
  @PrimaryGeneratedColumn({ name: 'visit_outcome_id' })
  id: number;

  @Column({ name: 'name', length: 100, unique: true })
  name: string;
}
