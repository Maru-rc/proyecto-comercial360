import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { VisitOrmEntity } from '../../../../visits/infrastructure/persistence/entities/visit.orm-entity.js';

@Entity('attachments')
export class AttachmentOrmEntity {
  @PrimaryGeneratedColumn({ name: 'attachment_id' })
  id: number;

  @Index()
  @ManyToOne(() => VisitOrmEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'visit_id' })
  visit: VisitOrmEntity | null;

  @Column({ name: 'category', length: 30 })
  category: string;

  @Column({ name: 's3_key', length: 500, unique: true })
  s3Key: string;

  @Column({ name: 'original_name', length: 255 })
  originalName: string;

  @Column({ name: 'mime_type', length: 100 })
  mimeType: string;

  @Column({ name: 'size', type: 'int' })
  size: number;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;

  @Column({ name: 'user', length: 150 })
  user: string;
}
