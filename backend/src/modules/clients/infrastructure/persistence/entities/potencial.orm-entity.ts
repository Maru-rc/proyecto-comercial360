import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('potencial')
export class PotencialOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_potencial' })
  idPotencial: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  // Display order: 1 = High, 2 = Medium, 3 = Low
  @Column({ type: 'int' })
  orden: number;
}
