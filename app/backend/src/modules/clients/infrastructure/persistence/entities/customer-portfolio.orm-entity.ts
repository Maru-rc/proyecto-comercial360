import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CustomerOrmEntity } from './customer.orm-entity.js';
import { PortfolioOrmEntity } from './portfolio.orm-entity.js';

@Entity('customer_portfolios')
export class CustomerPortfolioOrmEntity {
  @PrimaryGeneratedColumn({ name: 'customer_portfolio_id' })
  id: number;

  @ManyToOne(() => CustomerOrmEntity, (customer) => customer.portfolios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<CustomerOrmEntity>;

  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customerId: number | null;

  @ManyToOne(() => PortfolioOrmEntity)
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Relation<PortfolioOrmEntity>;

  @Column({ name: 'portfolio_id', type: 'int', nullable: true })
  portfolioId: number | null;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;
}
