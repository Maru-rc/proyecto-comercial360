import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('attachments')
export class AttachmentOrmEntity {
  @PrimaryGeneratedColumn({ name: 'attachment_id' })
  id: number;

  @Column({ name: 'visit_id', nullable: true, type: 'int' })
  visitId: number | null;

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
