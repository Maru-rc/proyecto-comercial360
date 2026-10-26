import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zones')
export class ZoneOrmEntity {
  @PrimaryGeneratedColumn({ name: 'zone_id' })
  id: number;

  @Column({ name: 'name', length: 100, unique: true })
  name: string;
}
