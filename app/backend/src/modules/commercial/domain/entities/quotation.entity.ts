export type QuotationStatus =
  'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuotationProps {
  id?: number;
  number: string;
  clientId: number;
  advisorId?: number | null;
  visitId?: number | null;
  amount: number;
  currency?: string;
  status?: QuotationStatus;
  date?: Date;
  createdAt?: Date;
}

export class Quotation {
  private constructor(private readonly props: QuotationProps) {}

  static create(props: QuotationProps): Quotation {
    if (!props.number?.trim()) {
      throw new Error('Quotation number is required');
    }
    if (!props.clientId || props.clientId <= 0) {
      throw new Error('Client ID must be valid');
    }
    if (
      props.amount === undefined ||
      props.amount === null ||
      props.amount < 0
    ) {
      throw new Error('Quotation amount must be greater than or equal to 0');
    }

    return new Quotation({
      ...props,
      number: props.number.trim(),
      advisorId: props.advisorId ?? null,
      visitId: props.visitId ?? null,
      currency: props.currency?.trim() || 'COP',
      status: props.status ?? 'DRAFT',
      date: props.date ?? new Date(),
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get number(): string {
    return this.props.number;
  }

  get quotationNumber(): string {
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

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency ?? 'COP';
  }

  get status(): QuotationStatus {
    return this.props.status ?? 'DRAFT';
  }

  get date(): Date | undefined {
    return this.props.date;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  accept(): void {
    if (this.props.status === 'REJECTED') {
      throw new Error('Cannot accept a rejected quotation');
    }
    this.props.status = 'ACCEPTED';
  }

  reject(): void {
    this.props.status = 'REJECTED';
  }
}
