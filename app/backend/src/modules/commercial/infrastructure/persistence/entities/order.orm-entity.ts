import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('orders')
export class OrderOrmEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'order_id' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'order_number' })
  number: string;

  @Column({ type: 'int', nullable: true, name: 'visit_id' })
  visitId: number | null;

  @Column({ type: 'int', nullable: true, name: 'quote_id' })
  quotationId: number | null;

  @Column({ type: 'int', name: 'customer_id' })
  clientId: number;

  @Column({ type: 'int', nullable: true, name: 'sales_representative_id' })
  advisorId: number | null;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    name: 'amount',
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) =>
        typeof value === 'string' ? parseFloat(value) : value,
    },
  })
  amount: number;

  @Column({ type: 'varchar', length: 30, default: 'CERRADO', name: 'status' })
  status: string;

  @Column({
    type: 'date',
    default: () => 'CURRENT_DATE',
    name: 'date',
  })
  date: Date;

  @Column({ type: 'date', nullable: true, name: 'estimated_delivery_date' })
  estimatedDeliveryDate: Date | null;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at', nullable: true })
  createdAt?: Date;
}
