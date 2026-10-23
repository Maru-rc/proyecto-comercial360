export interface CreateHistoryEntryContractDto {
  readonly clientId: number;
  readonly action?: string;
  readonly eventType?: string;
  readonly user?: string;
  readonly author?: string;
  readonly description: string;
  readonly visitId?: number | null;
  readonly metadata?: Record<string, unknown> | null;
}

export interface HistoryEntryContractDto {
  readonly id: number;
  readonly clientId: number;
  readonly action?: string;
  readonly eventType?: string;
  readonly user?: string;
  readonly author?: string;
  readonly description: string;
  readonly visitId?: number | null;
  readonly createdAt?: Date | string;
  readonly metadata?: Record<string, unknown> | null;
}
