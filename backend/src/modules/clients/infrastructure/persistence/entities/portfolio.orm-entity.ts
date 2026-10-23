import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('portfolios')
export class PortfolioOrmEntity {
  @PrimaryGeneratedColumn({ name: 'portfolio_id' })
  id: number;

  @Column({ name: 'name', length: 100, unique: true })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string | null;
}
