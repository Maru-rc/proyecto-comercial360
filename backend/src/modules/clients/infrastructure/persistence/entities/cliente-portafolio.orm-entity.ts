import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClienteOrmEntity } from './cliente.orm-entity.js';
import { PortafolioOrmEntity } from './portafolio.orm-entity.js';

// Tabla intermedia de la relación muchos a muchos Cliente <-> Portafolio
@Entity('cliente_portafolio')
export class ClientePortafolioOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_cliente_portafolio' })
  idClientePortafolio: number;

  @ManyToOne(() => ClienteOrmEntity, (c) => c.portafolios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_cliente' })
  cliente: ClienteOrmEntity;

  @ManyToOne(() => PortafolioOrmEntity)
  @JoinColumn({ name: 'id_portafolio' })
  portafolio: PortafolioOrmEntity;

  @CreateDateColumn({ name: 'fecha_registro' })
  fechaRegistro: Date;
}
