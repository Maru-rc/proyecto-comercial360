import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('potentials')
export class PotentialOrmEntity {
  @PrimaryGeneratedColumn({ name: 'potential_id' })
  id: number;

  @Column({ name: 'name', length: 100, unique: true })
  name: string;

  // Display order: 1 = High, 2 = Medium, 3 = Low
  @Column({ name: 'sort_order', type: 'int' })
  sortOrder: number;
}
