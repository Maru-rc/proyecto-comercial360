import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('estado_cliente')
export class EstadoClienteOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_estado_cliente' })
  id: number;

  @Column({ name: 'nombre', length: 100, unique: true })
  name: string;
}
