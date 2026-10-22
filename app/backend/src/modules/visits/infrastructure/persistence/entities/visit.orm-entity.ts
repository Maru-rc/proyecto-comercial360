import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('visita')
export class VisitOrmEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id_visita' })
  id: number;

  @Column({ type: 'int', name: 'id_cliente' })
  clientId: number;

  @Column({ type: 'int', name: 'id_asesor' })
  advisorId: number;

  @Column({ type: 'int', nullable: true, name: 'id_ruta' })
  routeId: number | null;

  @Column({ type: 'timestamp', name: 'fecha_programada' })
  scheduledDate: Date;

  @Column({ type: 'int', default: 1, name: 'orden_visita' })
  visitOrder: number;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'hora_inicio' })
  startTime: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'hora_fin' })
  endTime: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'SCHEDULED',
    name: 'estado_visita',
  })
  visitStatus: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: 'IN_PERSON',
    name: 'tipo_visita',
  })
  visitType: string | null;

  @Column({ type: 'text', nullable: true, name: 'objetivo' })
  objective: string | null;

  @Column({ type: 'text', nullable: true, name: 'observacion' })
  observation: string | null;

  @Column({ type: 'text', nullable: true, name: 'evidencia_s3_key' })
  evidenceS3Key: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
