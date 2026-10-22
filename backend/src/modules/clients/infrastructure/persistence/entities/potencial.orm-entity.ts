import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('potencial')
export class PotencialOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_potencial' })
  idPotencial: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  // Orden de visualización: 1 = Alto, 2 = Medio, 3 = Bajo
  @Column({ type: 'int' })
  orden: number;
}
