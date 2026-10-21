import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tipo_cliente')
export class TipoClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_tipo_cliente' })
  idTipoCliente: number;

  @Column({ length: 100 })
  nombre: string;
}
