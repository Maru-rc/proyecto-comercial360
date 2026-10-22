export interface FollowUpProps {
  id?: number;
  clientId: number;
  visitId?: number | null;
  responsibleAdvisorId?: number | null;
  nextContactDate: Date;
  activity: string;
  isCompleted?: boolean;
  observation?: string | null;
  createdAt?: Date;
}

export class FollowUp {
  private constructor(private readonly props: FollowUpProps) {}

  static create(props: FollowUpProps): FollowUp {
    if (!props.activity?.trim()) {
      throw new Error('Follow-up activity is required');
    }
    if (!props.nextContactDate) {
      throw new Error('Follow-up next contact date is required');
    }
    return new FollowUp({
      ...props,
      isCompleted: props.isCompleted ?? false,
      visitId: props.visitId ?? null,
      responsibleAdvisorId: props.responsibleAdvisorId ?? null,
      observation: props.observation ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get clientId(): number {
    return this.props.clientId;
  }

  get visitId(): number | null | undefined {
    return this.props.visitId;
  }

  get responsibleAdvisorId(): number | null | undefined {
    return this.props.responsibleAdvisorId;
  }

  get nextContactDate(): Date {
    return this.props.nextContactDate;
  }

  get activity(): string {
    return this.props.activity;
  }

  get isCompleted(): boolean {
    return this.props.isCompleted ?? false;
  }

  get observation(): string | null | undefined {
    return this.props.observation;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }

  markCompleted(): void {
    this.props.isCompleted = true;
  }
}
