export interface RouteContractDto {
  readonly id: number;
  readonly name?: string;
  readonly description?: string | null;
  readonly territoryId?: number | null;
  readonly advisorId?: number | null;
  readonly executionDay?: string | null;
  readonly frequency?: string | null;
  readonly status: string;
  readonly startTime?: string | null;
  readonly endTime?: string | null;
  readonly startDate?: Date | string | null;
  readonly endDate?: Date | string | null;
}

export interface RouteStopContractDto {
  readonly id: number;
  readonly routeId: number;
  readonly clientId: number;
  readonly visitOrder?: number;
  readonly order?: number;
  readonly suggestedTime?: string | null;
}
