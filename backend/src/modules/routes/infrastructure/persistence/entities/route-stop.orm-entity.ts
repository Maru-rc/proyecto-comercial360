import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { RouteOrmEntity } from './route.orm-entity.js';
import { CustomerOrmEntity } from '../../../../clients/infrastructure/persistence/entities/customer.orm-entity.js';

@Entity('route_stops')
export class RouteStopOrmEntity {
  @PrimaryGeneratedColumn({ name: 'route_stop_id' })
  id: number;

  @ManyToOne(() => RouteOrmEntity, (route) => route.stops, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'route_id' })
  route: Relation<RouteOrmEntity>;

  @ManyToOne(() => CustomerOrmEntity)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerOrmEntity;

  @Column({ name: 'visit_order', type: 'int' })
  visitOrder: number;

  @Column({ name: 'suggested_time', type: 'time', nullable: true })
  suggestedTime: string | null;
}
