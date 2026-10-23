export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROCESS'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderProps {
  id?: number;
  number: string;
  clientId: number;
  advisorId?: number | null;
  visitId?: number | null;
  quotationId?: number | null;
  amount: number;
  status?: OrderStatus;
  date?: Date;
  estimatedDeliveryDate?: Date | null;
  createdAt?: Date;
}

export class Order {
  private constructor(private readonly props: OrderProps) {}

  static create(props: OrderProps): Order {
    if (!props.number?.trim()) {
      throw new Error('Order number is required');
    }
    if (!props.clientId || props.clientId <= 0) {
      throw new Error('Client ID must be valid');
    }
    if (
      props.amount === undefined ||
      props.amount === null ||
      props.amount <= 0
    ) {
      throw new Error('Order amount must be greater than 0');
    }

    return new Order({
      ...props,
      number: props.number.trim(),
      advisorId: props.advisorId ?? null,
      visitId: props.visitId ?? null,
      quotationId: props.quotationId ?? null,
      status: props.status ?? 'PENDING',
      date: props.date ?? new Date(),
      estimatedDeliveryDate: props.estimatedDeliveryDate ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get number(): string {
    return this.props.number;
  }

  get orderNumber(): string {
    return this.props.number;
  }

  get clientId(): number {
    return this.props.clientId;
  }

  get advisorId(): number | null | undefined {
    return this.props.advisorId;
  }

  get visitId(): number | null | undefined {
    return this.props.visitId;
  }

  get quotationId(): number | null | undefined {
    return this.props.quotationId;
  }

  get amount(): number {
    return this.props.amount;
  }

  get status(): OrderStatus {
    return this.props.status ?? 'PENDING';
  }

  get date(): Date | undefined {
    return this.props.date;
  }

  get estimatedDeliveryDate(): Date | null | undefined {
    return this.props.estimatedDeliveryDate;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  confirm(): void {
    if (this.props.status === 'CANCELLED') {
      throw new Error('Cannot confirm a cancelled order');
    }
    this.props.status = 'CONFIRMED';
  }

  cancel(): void {
    if (this.props.status === 'DELIVERED') {
      throw new Error('Cannot cancel an already delivered order');
    }
    this.props.status = 'CANCELLED';
  }
}
