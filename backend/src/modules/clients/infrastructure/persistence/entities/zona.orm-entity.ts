import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('zona')
export class ZonaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_zona' })
  idZona: number;

  @Column({ length: 100 })
  nombre: string;
}
