export type RouteStatus = 'BORRADOR' | 'ASIGNADA' | 'EN_CURSO' | 'COMPLETADA';

export interface RouteRecord {
  id: number;
  name: string;
  zoneId: number | null;
  zoneName?: string | null;
  executionDay: string | null;
  frequency: string | null;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
  status: RouteStatus;
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  salesRepresentativeId?: number | null;
}

export interface RouteStopRecord {
  id?: number;
  routeId: number;
  customerId: number;
  visitOrder: number;
  suggestedTime: string | null;
}

export interface RouteRepository {
  save(route: Partial<RouteRecord>): Promise<RouteRecord>;
  findById(id: number): Promise<RouteRecord | null>;
  findAll(): Promise<RouteRecord[]>;
  existsByName(name: string): Promise<boolean>;
  setStops(
    routeId: number,
    stops: Array<{
      customerId: number;
      visitOrder: number;
      suggestedTime?: string | null;
    }>,
  ): Promise<RouteStopRecord[]>;
  getStops(routeId: number): Promise<RouteStopRecord[]>;
}

export const ROUTE_REPOSITORY = Symbol('ROUTE_REPOSITORY');
