import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('resultado_visita')
export class ResultadoVisitaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_resultado' })
  id: number;

  @Column({ name: 'nombre', length: 100, unique: true })
  name: string;
}
