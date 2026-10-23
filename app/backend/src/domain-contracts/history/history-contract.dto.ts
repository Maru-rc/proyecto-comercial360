export interface CreateHistoryEntryContractDto {
  clientId: number;
  action?: string;
  eventType?: string;
  user?: string;
  author?: string;
  description: string;
  visitId?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface HistoryEntryContractDto {
  id: number;
  clientId: number;
  action?: string;
  eventType?: string;
  user?: string;
  author?: string;
  description: string;
  visitId?: number | null;
  createdAt?: Date | string;
  metadata?: Record<string, unknown> | null;
}
