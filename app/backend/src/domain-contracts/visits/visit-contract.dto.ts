export type MapPinStatus =
  'VISITED' | 'PENDING' | 'NOT_VISITED' | 'ORDER_CLOSED' | 'RESCHEDULED';

export interface VisitContractDto {
  readonly id: number;
  readonly clientId: number;
  readonly advisorId: number;
  readonly routeId?: number | null;
  readonly scheduledDate?: Date | string;
  readonly actualDate?: Date | string | null;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
  readonly visitStatus?: string;
  readonly status?: string;
  readonly objective?: string | null;
  readonly visitType?: string | null;
  readonly contactChannel?: string | null;
  readonly observation?: string | null;
  readonly observations?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
}

export interface VisitAgendaItemContractDto {
  readonly id: number;
  readonly clientId: number;
  readonly clientName: string;
  readonly clientAddress?: string | null;
  readonly address?: string | null;
  readonly visitOrder?: number;
  readonly order?: number;
  readonly suggestedTime?: string | null;
  readonly time?: string;
  readonly visitStatus?: string;
  readonly status?: string;
  readonly potential?: string;
  readonly objective?: string | null;
  readonly latitude?: number | null;
  readonly longitude?: number | null;
  readonly contactName?: string | null;
  readonly contactPhone?: string | null;
  readonly primaryContact?: {
    readonly name: string;
    readonly phone: string;
  } | null;
  readonly isCurrent?: boolean;
  readonly active?: boolean;
}

export interface VisitMapStopContractDto {
  readonly id: number;
  readonly clientId: number;
  readonly clientName: string;
  readonly address?: string | null;
  readonly order?: number;
  readonly latitude: number | null;
  readonly longitude: number | null;
  readonly pinStatus: MapPinStatus;
  readonly color?: string;
  readonly colorHex?: string;
}

export type VisitMapItemContractDto = VisitMapStopContractDto;
