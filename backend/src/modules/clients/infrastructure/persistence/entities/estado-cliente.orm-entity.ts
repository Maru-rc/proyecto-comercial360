import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('estado_cliente')
export class EstadoClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_estado_cliente' })
  idEstadoCliente: number;

  @Column({ length: 100 })
  nombre: string;
}
