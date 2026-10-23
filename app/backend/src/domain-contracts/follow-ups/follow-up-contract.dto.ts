export interface FollowUpContractDto {
  id: number;
  clientId: number;
  visitId?: number | null;
  responsibleAdvisorId?: number | null;
  nextContactDate: Date | string;
  activity: string;
  isCompleted: boolean;
  observation?: string | null;
}
