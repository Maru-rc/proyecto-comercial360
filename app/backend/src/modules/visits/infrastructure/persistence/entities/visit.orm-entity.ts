import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('visits')
export class VisitOrmEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'visit_id' })
  id: number;

  @Column({ type: 'int', name: 'customer_id' })
  clientId: number;

  @Column({ type: 'int', name: 'sales_representative_id' })
  advisorId: number;

  @Column({ type: 'int', nullable: true, name: 'route_id' })
  routeId: number | null;

  @Column({ type: 'int', nullable: true, name: 'portfolio_id' })
  portfolioId: number | null;

  @Column({ type: 'timestamp', name: 'scheduled_at' })
  scheduledDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'actual_at' })
  actualAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'end_time' })
  endTime: Date | null;

  @Column({
    type: 'varchar',
    length: 30,
    default: 'PENDIENTE',
    name: 'visit_status',
  })
  visitStatus: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: 'IN_PERSON',
    name: 'visit_type',
  })
  visitType: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true, name: 'objective' })
  objective: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'interest' })
  interest: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'competitor' })
  competitor: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'contact_channel',
  })
  contactChannel: string | null;

  // Unpersisted / joined fields for domain mapping
  visitOrder?: number;
  startTime?: string | null;
  observation?: string | null;
  evidenceS3Key?: string | null;
  createdAt?: Date;
}
