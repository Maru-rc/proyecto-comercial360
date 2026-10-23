export type OutcomeType =
  'SUCCESSFUL' | 'NO_SALE' | 'RESCHEDULED' | 'CANCELLED';

export interface VisitOutcomeProps {
  id?: number;
  visitId: number;
  outcome: OutcomeType;
  reasonNoSale?: string | null;
  observations?: string | null;
  evidenceS3Key?: string | null;
  createdAt?: Date;
}

export class VisitOutcome {
  private constructor(private readonly props: VisitOutcomeProps) {}

  static create(props: VisitOutcomeProps): VisitOutcome {
    if (!props.visitId || props.visitId <= 0) {
      throw new Error('Visit ID must be a valid positive integer');
    }
    if (!props.outcome) {
      throw new Error('Visit outcome is required');
    }
    if (props.observations && props.observations.length > 500) {
      throw new Error('Observations cannot exceed 500 characters');
    }

    return new VisitOutcome({
      ...props,
      reasonNoSale: props.reasonNoSale ?? null,
      observations: props.observations ?? null,
      evidenceS3Key: props.evidenceS3Key ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  get id(): number | undefined {
    return this.props.id;
  }

  get visitId(): number {
    return this.props.visitId;
  }

  get outcome(): OutcomeType {
    return this.props.outcome;
  }

  get reasonNoSale(): string | null | undefined {
    return this.props.reasonNoSale;
  }

  get observations(): string | null | undefined {
    return this.props.observations;
  }

  get observation(): string | null | undefined {
    return this.props.observations;
  }

  get evidenceS3Key(): string | null | undefined {
    return this.props.evidenceS3Key;
  }

  get createdAt(): Date | undefined {
    return this.props.createdAt;
  }
}
