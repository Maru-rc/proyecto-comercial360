export interface RouteContractDto {
  id: number;
  name?: string;
  description?: string | null;
  territoryId?: number | null;
  advisorId?: number | null;
  executionDay?: string | null;
  frequency?: string | null;
  status: string;
  startTime?: string | null;
  endTime?: string | null;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
}

export interface RouteStopContractDto {
  id: number;
  routeId: number;
  clientId: number;
  visitOrder?: number;
  order?: number;
  suggestedTime?: string | null;
}
