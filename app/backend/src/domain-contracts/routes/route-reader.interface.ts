import type {
  RouteContractDto,
  RouteStopContractDto,
} from './route-contract.dto.js';

export interface RouteReader {
  getRouteById(id: number): Promise<RouteContractDto | null>;
  getStopsByRouteId(routeId: number): Promise<RouteStopContractDto[]>;
}
