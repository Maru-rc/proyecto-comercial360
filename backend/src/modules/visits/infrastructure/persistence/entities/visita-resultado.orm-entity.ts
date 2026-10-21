import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VisitaOrmEntity } from './visita.orm-entity.js';
import { ResultadoVisitaOrmEntity } from './resultado-visita.orm-entity.js';

@Entity('visita_resultado')
export class VisitaResultadoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_visita_resultado' })
  idVisitaResultado: number;

  @ManyToOne(() => VisitaOrmEntity, (v) => v.resultados, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_visita' })
  visita: VisitaOrmEntity;

  @ManyToOne(() => ResultadoVisitaOrmEntity)
  @JoinColumn({ name: 'id_resultado' })
  resultado: ResultadoVisitaOrmEntity;

  @Column({ type: 'text', nullable: true })
  observacion: string | null;
}
