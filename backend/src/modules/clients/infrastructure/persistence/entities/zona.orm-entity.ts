import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zona')
export class ZonaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_zona' })
  id: number;

  @Column({ name: 'nombre', length: 100, unique: true })
  name: string;
}
