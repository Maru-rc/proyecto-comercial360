import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('follow_ups')
export class FollowUpOrmEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'follow_up_id' })
  id: number;

  @Column({ type: 'int', nullable: true, name: 'visit_id' })
  visitId: number | null;

  @Column({
    type: 'int',
    nullable: true,
    name: 'responsible_sales_representative_id',
  })
  responsibleAdvisorId: number | null;

  @Column({ type: 'timestamp', name: 'next_date' })
  nextContactDate: Date;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'activity' })
  activity: string;

  @Column({ type: 'boolean', default: false, name: 'is_completed' })
  isCompleted: boolean;

  @Column({ type: 'text', nullable: true, name: 'observation' })
  observation: string | null;

  // Not mapped to a physical column if not in DB, kept as virtual property for domain
  clientId?: number;
}
