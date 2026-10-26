import { Inject, Injectable } from '@nestjs/common';
import type {
  RouteRecord,
  RouteRepository,
  RouteStopRecord,
} from '../ports/route.repository.port.js';
import { ROUTE_REPOSITORY } from '../ports/route.repository.port.js';
import { EntityNotFoundException } from '../../../../domain-contracts/index.js';

export interface RouteDetailResult extends RouteRecord {
  paradas: RouteStopRecord[];
}

@Injectable()
export class GetRouteByIdUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routeRepository: RouteRepository,
  ) {}

  async execute(id: number): Promise<RouteDetailResult> {
    const route = await this.routeRepository.findById(id);
    if (!route) {
      throw new EntityNotFoundException('Ruta no encontrada');
    }

    const paradas = await this.routeRepository.getStops(id);

    return {
      ...route,
      paradas,
    };
  }
}
