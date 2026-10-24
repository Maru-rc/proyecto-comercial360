import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ZoneOrmEntity } from '../../clients/infrastructure/persistence/entities/zone.orm-entity.js';
import { RouteStopOrmEntity } from './route-stop.orm-entity.js';

@Entity('routes')
export class RouteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'route_id' })
  id: number;

  @Column({ name: 'name', length: 200 })
  name: string;

  @Column({ name: 'sales_representative_id', nullable: true })
  salesRepresentativeId: number | null;

  @Column({ name: 'zone_id', nullable: true })
  zoneId: number | null;

  @ManyToOne(() => ZoneOrmEntity, { nullable: true })
  @JoinColumn({ name: 'zone_id' })
  zone: ZoneOrmEntity | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'status', length: 30, default: 'BORRADOR' })
  status: string;

  @Column({
    name: 'execution_day',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  executionDay: string | null;

  @Column({ name: 'frequency', type: 'varchar', length: 20, nullable: true })
  frequency: string | null;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime: string | null;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string | null;

  @Column({ name: 'description', type: 'varchar', length: 200, nullable: true })
  description: string | null;

  @OneToMany(() => RouteStopOrmEntity, (routeStop) => routeStop.route)
  stops: RouteStopOrmEntity[];
}
