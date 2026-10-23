import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { CustomerOrmEntity } from './customer.orm-entity.js';
import { PortfolioOrmEntity } from './portfolio.orm-entity.js';

// Junction table for the many-to-many Customer <-> Portfolio relationship
@Entity('customer_portfolios')
export class CustomerPortfolioOrmEntity {
  @PrimaryGeneratedColumn({ name: 'customer_portfolio_id' })
  id: number;

  @ManyToOne(() => CustomerOrmEntity, (customer) => customer.portfolios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Relation<CustomerOrmEntity>;

  @ManyToOne(() => PortfolioOrmEntity)
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: PortfolioOrmEntity;

  @CreateDateColumn({ name: 'registered_at' })
  registeredAt: Date;
}
