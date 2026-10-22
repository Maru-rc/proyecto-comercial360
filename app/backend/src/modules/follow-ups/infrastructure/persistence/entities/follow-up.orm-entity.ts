import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('seguimiento')
export class FollowUpOrmEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id_seguimiento' })
  id: number;

  @Column({ type: 'int', name: 'id_cliente' })
  clientId: number;

  @Column({ type: 'int', nullable: true, name: 'id_visita' })
  visitId: number | null;

  @Column({ type: 'int', nullable: true, name: 'id_asesor_responsable' })
  responsibleAdvisorId: number | null;

  @Column({ type: 'timestamp', name: 'fecha_proxima' })
  nextContactDate: Date;

  @Column({ type: 'text', name: 'actividad' })
  activity: string;

  @Column({ type: 'boolean', default: false, name: 'completado' })
  isCompleted: boolean;

  @Column({ type: 'text', nullable: true, name: 'observacion' })
  observation: string | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
