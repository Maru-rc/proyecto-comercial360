import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('portafolio')
export class PortafolioOrmEntity {
  @PrimaryGeneratedColumn({ name: 'id_portafolio' })
  id: number;

  @Column({ name: 'nombre', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;
}
