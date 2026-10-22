import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CustomerOrmEntity } from '../../../../clients/infrastructure/persistence/entities/customer.orm-entity.js';
import { SalesRepresentativeOrmEntity } from '../../../../commercial/infrastructure/persistence/entities/sales-representative.orm-entity.js';
import { RouteOrmEntity } from '../../../../routes/infrastructure/persistence/entities/route.orm-entity.js';
import { PortfolioOrmEntity } from '../../../../clients/infrastructure/persistence/entities/portfolio.orm-entity.js';
import { VisitResultOrmEntity } from './visit-result.orm-entity.js';

@Entity('visits')
export class VisitOrmEntity {
  @PrimaryGeneratedColumn({ name: 'visit_id' })
  id: number;

  @ManyToOne(() => CustomerOrmEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerOrmEntity;

  @ManyToOne(() => SalesRepresentativeOrmEntity)
  @JoinColumn({ name: 'sales_representative_id' })
  salesRepresentative: SalesRepresentativeOrmEntity;

  @ManyToOne(() => RouteOrmEntity, { nullable: true })
  @JoinColumn({ name: 'route_id' })
  route: RouteOrmEntity | null;

  @Column({ name: 'scheduled_at', type: 'timestamp' })
  scheduledAt: Date;

  @Column({ name: 'actual_at', type: 'timestamp', nullable: true })
  actualAt: Date | null;

  @Column({ name: 'end_time', type: 'timestamp', nullable: true })
  endTime: Date | null;

  @Column({ name: 'visit_status', length: 30, default: 'PENDIENTE' })
  visitStatus: string;

  @Column({ name: 'objective', type: 'varchar', length: 300, nullable: true })
  objective: string | null;

  @Column({ name: 'visit_type', type: 'varchar', length: 50, nullable: true })
  visitType: string | null;

  @Column({ name: 'interest', type: 'varchar', length: 100, nullable: true })
  interest: string | null;

  @ManyToOne(() => PortfolioOrmEntity, { nullable: true })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: PortfolioOrmEntity | null;

  @Column({ name: 'competitor', type: 'varchar', length: 200, nullable: true })
  competitor: string | null;

  @Column({
    name: 'contact_channel',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  contactChannel: string | null;

  @OneToMany(() => VisitResultOrmEntity, (visitResult) => visitResult.visit)
  outcomes: VisitResultOrmEntity[];
}
