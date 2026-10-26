export interface FollowUpContractDto {
  readonly id: number;
  readonly clientId: number;
  readonly visitId?: number | null;
  readonly responsibleAdvisorId?: number | null;
  readonly nextContactDate: Date | string;
  readonly activity: string;
  readonly isCompleted: boolean;
  readonly observation?: string | null;
}
