export type MapPinStatus =
  'VISITED' | 'PENDING' | 'NOT_VISITED' | 'ORDER_CLOSED' | 'RESCHEDULED';

export interface VisitContractDto {
  id: number;
  clientId: number;
  advisorId: number;
  routeId?: number | null;
  scheduledDate?: Date | string;
  actualDate?: Date | string | null;
  startTime?: string | null;
  endTime?: string | null;
  visitStatus?: string;
  status?: string;
  objective?: string | null;
  visitType?: string | null;
  contactChannel?: string | null;
  observation?: string | null;
  observations?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface VisitAgendaItemContractDto {
  id: number;
  clientId: number;
  clientName: string;
  clientAddress?: string | null;
  address?: string | null;
  visitOrder?: number;
  order?: number;
  suggestedTime?: string | null;
  time?: string;
  visitStatus?: string;
  status?: string;
  potential?: string;
  objective?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contactName?: string | null;
  contactPhone?: string | null;
  primaryContact?: {
    name: string;
    phone: string;
  } | null;
  isCurrent?: boolean;
  active?: boolean;
}

export interface VisitMapStopContractDto {
  id: number;
  clientId: number;
  clientName: string;
  address?: string | null;
  order?: number;
  latitude: number | null;
  longitude: number | null;
  pinStatus: MapPinStatus;
  color?: string;
  colorHex?: string;
}

export type VisitMapItemContractDto = VisitMapStopContractDto;
