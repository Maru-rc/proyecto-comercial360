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
  idVisita: number;

  @ManyToOne(() => ClienteOrmEntity)
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteOrmEntity;

  @ManyToOne(() => AsesorOrmEntity)
  @JoinColumn({ name: 'id_asesor' })
  asesor: AsesorOrmEntity;

  @ManyToOne(() => RutaOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_ruta' })
  ruta: RutaOrmEntity | null;

  @Column({ name: 'fecha_programada', type: 'timestamp' })
  fechaProgramada: Date;

  @Column({ name: 'fecha_real', type: 'timestamp', nullable: true })
  fechaReal: Date | null;

  @Column({ name: 'hora_fin', type: 'timestamp', nullable: true })
  horaFin: Date | null;

  @Column({ name: 'estado_visita', length: 30, default: 'PENDIENTE' })
  estadoVisita: string;

  @Column({ length: 300, nullable: true })
  objetivo: string | null;

  @Column({ name: 'tipo_visita', length: 50, nullable: true })
  tipoVisita: string | null;

  @Column({ length: 100, nullable: true })
  interes: string | null;

  @ManyToOne(() => PortafolioOrmEntity, { nullable: true })
  @JoinColumn({ name: 'id_portafolio' })
  portafolio: PortafolioOrmEntity | null;

  @Column({ length: 200, nullable: true })
  competencia: string | null;

  @Column({ name: 'canal_contacto', length: 50, nullable: true })
  canalContacto: string | null;

  @OneToMany(() => VisitaResultadoOrmEntity, (vr) => vr.visita)
  resultados: VisitaResultadoOrmEntity[];
}
