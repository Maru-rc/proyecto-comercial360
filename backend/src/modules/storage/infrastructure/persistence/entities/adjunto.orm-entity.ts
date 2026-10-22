import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VisitaOrmEntity } from '../../../../visits/infrastructure/persistence/entities/visita.orm-entity.js';

@Entity('adjunto')
export class AdjuntoOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_adjunto' })
  idAdjunto: number;

  @Index()
  @ManyToOne(() => VisitaOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_visita' })
  visita: VisitaOrmEntity | null;

  @Column({ length: 30 })
  categoria: string;

  @Column({ name: 's3_key', length: 500, unique: true })
  s3Key: string;

  @Column({ name: 'nombre_original', length: 255 })
  nombreOriginal: string;

  @Column({ name: 'tipo_mime', length: 100 })
  tipoMime: string;

  @Column({ type: 'int' })
  tamano: number;

  @CreateDateColumn({ name: 'fecha_carga' })
  fechaCarga: Date;

  @Column({ length: 150 })
  usuario: string;
}
