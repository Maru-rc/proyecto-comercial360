import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('portafolio')
export class PortafolioOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_portafolio' })
  idPortafolio: number;

  @Column({ length: 100, unique: true })
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string | null;
}
