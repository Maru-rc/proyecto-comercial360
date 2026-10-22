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
  id: number;

  @Index()
  @ManyToOne(() => VisitaOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'id_visita' })
  visit: VisitaOrmEntity | null;

  @Column({ name: 'categoria', length: 30 })
  category: string;

  @Column({ name: 's3_key', length: 500, unique: true })
  s3Key: string;

  @Column({ name: 'nombre_original', length: 255 })
  originalName: string;

  @Column({ name: 'tipo_mime', length: 100 })
  mimeType: string;

  @Column({ name: 'tamano', type: 'int' })
  size: number;

  @CreateDateColumn({ name: 'fecha_carga' })
  uploadedAt: Date;

  @Column({ name: 'usuario', length: 150 })
  user: string;
}
