import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('resultado_visita')
export class ResultadoVisitaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_resultado' })
  idResultado: number;

  @Column({ length: 100, unique: true })
  nombre: string;
}
