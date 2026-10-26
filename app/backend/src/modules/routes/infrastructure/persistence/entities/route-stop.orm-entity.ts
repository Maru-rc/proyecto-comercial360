import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import { RouteOrmEntity } from './route.orm-entity.js';

@Entity('route_stops')
export class RouteStopOrmEntity {
  @PrimaryGeneratedColumn({ name: 'route_stop_id' })
  id: number;

  @Column({ name: 'route_id' })
  routeId: number;

  @ManyToOne(() => RouteOrmEntity, (route) => route.stops, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'route_id' })
  route: Relation<RouteOrmEntity>;

  @Column({ name: 'customer_id' })
  customerId: number;

  @Column({ name: 'visit_order' })
  visitOrder: number;

  @Column({ name: 'suggested_time', type: 'time', nullable: true })
  suggestedTime: string | null;
}
