import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteOrmEntity } from '../../../../clients/infrastructure/persistence/entities/cliente.orm-entity.js';
import { AsesorOrmEntity } from '../../../../commercial/infrastructure/persistence/entities/asesor.orm-entity.js';
import { RutaOrmEntity } from '../../../../routes/infrastructure/persistence/entities/ruta.orm-entity.js';
import { PortafolioOrmEntity } from '../../../../clients/infrastructure/persistence/entities/portafolio.orm-entity.js';
import { VisitaResultadoOrmEntity } from './visita-resultado.orm-entity.js';

@Entity('visita')
export class VisitaOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_visita' })
  id: number;

  @ManyToOne(() => ClienteOrmEntity)
  @JoinColumn({ name: 'id_cliente' })
  customer: ClienteOrmEntity;

  @ManyToOne(() => AsesorOrmEntity)
  @JoinColumn({ name: 'id_asesor' })
  salesRepresentative: AsesorOrmEntity;

  @ManyToOne(() => RutaOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_ruta' })
  route: RutaOrmEntity | null;

  @Column({ name: 'fecha_programada', type: 'timestamp' })
  scheduledAt: Date;

  @Column({ name: 'fecha_real', type: 'timestamp', nullable: true })
  actualAt: Date | null;

  @Column({ name: 'hora_fin', type: 'timestamp', nullable: true })
  endTime: Date | null;

  @Column({ name: 'estado_visita', length: 30, default: 'PENDIENTE' })
  visitStatus: string;

  @Column({ name: 'objetivo', type: 'varchar', length: 300, nullable: true })
  objective: string | null;

  @Column({ name: 'tipo_visita', type: 'varchar', length: 50, nullable: true })
  visitType: string | null;

  @Column({ name: 'interes', type: 'varchar', length: 100, nullable: true })
  interest: string | null;

  @ManyToOne(() => PortafolioOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_portafolio' })
  portfolio: PortafolioOrmEntity | null;

  @Column({ name: 'competencia', type: 'varchar', length: 200, nullable: true })
  competitor: string | null;

  @Column({
    name: 'canal_contacto',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  contactChannel: string | null;

  @OneToMany(() => VisitaResultadoOrmEntity, (visitResult) => visitResult.visit)
  outcomes: VisitaResultadoOrmEntity[];
}
