import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('cotizacion')
export class QuotationOrmEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id_cotizacion' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'numero' })
  number: string;

  @Column({ type: 'int', nullable: true, name: 'id_visita' })
  visitId: number | null;

  @Column({ type: 'int', name: 'id_cliente' })
  clientId: number;

  @Column({ type: 'int', nullable: true, name: 'id_asesor' })
  advisorId: number | null;

  @Column({
    type: 'numeric',
    precision: 14,
    scale: 2,
    name: 'valor',
    transformer: {
      to: (value: number) => value,
      from: (value: string | number) =>
        typeof value === 'string' ? parseFloat(value) : value,
    },
  })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'COP', name: 'moneda' })
  currency: string;

  @Column({ type: 'varchar', length: 30, default: 'DRAFT', name: 'estado' })
  status: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'fecha',
  })
  date: Date;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}
