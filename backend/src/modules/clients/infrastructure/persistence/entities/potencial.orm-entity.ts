import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('potencial')
export class PotencialOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_potencial' })
  id: number;

  @Column({ name: 'nombre', length: 100, unique: true })
  name: string;

  // Display order: 1 = High, 2 = Medium, 3 = Low
  @Column({ type: 'int' })
  sortOrder: number;
}
