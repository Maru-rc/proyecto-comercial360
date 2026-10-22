import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('resultado_visita')
export class VisitOutcomeOrmEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id_resultado' })
  id: number;

  @Column({ type: 'int', name: 'id_visita' })
  visitId: number;

  @Column({ type: 'varchar', length: 50, name: 'resultado' })
  outcome: string;

  @Column({ type: 'text', nullable: true, name: 'motivo_no_venta' })
  reasonNoSale: string | null;

  @Column({ type: 'text', nullable: true, name: 'observaciones' })
  observations: string | null;

  @Column({ type: 'text', nullable: true, name: 'evidencia_s3_key' })
  evidenceS3Key: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
