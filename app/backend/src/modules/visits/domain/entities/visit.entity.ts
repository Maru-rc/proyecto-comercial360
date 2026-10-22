export type VisitStatus =
  'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'RESCHEDULED' | 'CANCELLED';

export interface VisitProps {
  id?: number;
  clientId: number;
  advisorId: number;
  routeId?: number | null;
  scheduledDate: Date;
  visitOrder?: number;
  startTime?: string | null;
  endTime?: string | null;
  visitStatus?: VisitStatus;
  visitType?: string | null;
  objective?: string | null;
  observation?: string | null;
  evidenceS3Key?: string | null;
  createdAt?: Date;
}

export class Visit {
  private constructor(private readonly props: VisitProps) {}

  static create(props: VisitProps): Visit {
    if (!props.clientId || props.clientId <= 0) {
      throw new Error('Client ID must be a positive integer');
    }
    if (!props.advisorId || props.advisorId <= 0) {
      throw new Error('Advisor ID must be a positive integer');
    }
    if (!props.scheduledDate) {
      throw new Error('Scheduled date is required');
    }

    return new Visit({
      ...props,
      routeId: props.routeId ?? null,
      visitOrder: props.visitOrder ?? 1,
      startTime: props.startTime ?? null,
      endTime: props.endTime ?? null,
      visitStatus: props.visitStatus ?? 'SCHEDULED',
      visitType: props.visitType ?? 'IN_PERSON',
      objective: props.objective ?? null,
      observation: props.observation ?? null,
      evidenceS3Key: props.evidenceS3Key ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get clientId(): number {
    return this.props.clientId;
  }

  get advisorId(): number {
    return this.props.advisorId;
  }

  get routeId(): number | null | undefined {
    return this.props.routeId;
  }

  get scheduledDate(): Date {
    return this.props.scheduledDate;
  }

  get visitOrder(): number {
    return this.props.visitOrder ?? 1;
  }

  get startTime(): string | null | undefined {
    return this.props.startTime;
  }

  get endTime(): string | null | undefined {
    return this.props.endTime;
  }

  get visitStatus(): VisitStatus {
    return this.props.visitStatus ?? 'SCHEDULED';
  }

  get status(): VisitStatus {
    return this.visitStatus;
  }

  get visitType(): string | null | undefined {
    return this.props.visitType;
  }

  get objective(): string | null | undefined {
    return this.props.objective;
  }

  get observation(): string | null | undefined {
    return this.props.observation;
  }

  get observations(): string | null | undefined {
    return this.props.observation;
  }

  get evidenceS3Key(): string | null | undefined {
    return this.props.evidenceS3Key;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  start(time?: string): void {
    this.props.visitStatus = 'IN_PROGRESS';
    if (time) {
      this.props.startTime = time;
    }
  }

  complete(
    observation?: string,
    evidenceS3Key?: string,
    endTime?: string,
  ): void {
    this.props.visitStatus = 'COMPLETED';
    if (observation) {
      this.props.observation = observation;
    }
    if (evidenceS3Key) {
      this.props.evidenceS3Key = evidenceS3Key;
    }
    if (endTime) {
      this.props.endTime = endTime;
    }
  }

  reschedule(newDate: Date, reason?: string): void {
    this.props.visitStatus = 'RESCHEDULED';
    this.props.scheduledDate = newDate;
    if (reason) {
      this.props.observation = reason;
    }
  }

  cancel(reason?: string): void {
    this.props.visitStatus = 'CANCELLED';
    if (reason) {
      this.props.observation = reason;
    }
  }
}
