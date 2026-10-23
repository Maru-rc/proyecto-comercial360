import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VisitOrmEntity } from './visit.orm-entity.js';
import { SalesRepresentativeOrmEntity } from '../../../../commercial/infrastructure/persistence/entities/sales-representative.orm-entity.js';

@Entity('follow_ups')
export class FollowUpOrmEntity {
  @PrimaryGeneratedColumn({ name: 'follow_up_id' })
  id: number;

  @ManyToOne(() => VisitOrmEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'visit_id' })
  visit: VisitOrmEntity;

  @Column({ name: 'next_date', type: 'timestamp' })
  nextDate: Date;

  @Column({ name: 'activity', type: 'varchar', length: 200, nullable: true })
  activity: string | null;

  @Column({ name: 'observation', type: 'text', nullable: true })
  observation: string | null;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @ManyToOne(() => SalesRepresentativeOrmEntity, { nullable: true })
  @JoinColumn({ name: 'responsible_sales_representative_id' })
  responsibleSalesRepresentative: SalesRepresentativeOrmEntity | null;
}
