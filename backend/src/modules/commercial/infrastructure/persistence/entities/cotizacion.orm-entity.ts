import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteOrmEntity } from '../../../../clients/infrastructure/persistence/entities/cliente.orm-entity.js';
import { AsesorOrmEntity } from './asesor.orm-entity.js';
import { CotizacionDetalleOrmEntity } from './cotizacion-detalle.orm-entity.js';

@Entity('cotizacion')
export class CotizacionOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_cotizacion' })
  idCotizacion: number;

  @Column({ unique: true, length: 50 })
  numero: string;

  @ManyToOne(() => ClienteOrmEntity)
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteOrmEntity;

  @ManyToOne(() => AsesorOrmEntity)
  @JoinColumn({ name: 'id_asesor' })
  asesor: AsesorOrmEntity;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  valor: number;

  @Column({ length: 30, default: 'ENVIADA' })
  estado: string;

  @Column({ length: 10, default: 'COP' })
  moneda: string;

  @OneToMany(() => CotizacionDetalleOrmEntity, (d) => d.cotizacion)
  detalles: CotizacionDetalleOrmEntity[];
}
