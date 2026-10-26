import { Inject, Injectable } from '@nestjs/common';
import type {
  RouteRepository,
  RouteStopRecord,
} from '../ports/route.repository.port.js';
import { ROUTE_REPOSITORY } from '../ports/route.repository.port.js';
import type { ClientReader } from '../../../../domain-contracts/index.js';
import {
  CLIENT_READER,
  EntityNotFoundException,
  ResourceConflictException,
} from '../../../../domain-contracts/index.js';
import { RouteStop } from '../../domain/entities/route-stop.entity.js';

export interface SetRouteStopInput {
  customerId: number;
  visitOrder?: number;
  suggestedTime?: string | null;
}

@Injectable()
export class SetRouteStopsUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routeRepository: RouteRepository,
    @Inject(CLIENT_READER)
    private readonly clientReader: ClientReader,
  ) {}

  async execute(
    routeId: number,
    stopsInput: SetRouteStopInput[],
  ): Promise<RouteStopRecord[]> {
    const route = await this.routeRepository.findById(routeId);
    if (!route) {
      throw new EntityNotFoundException('Ruta no encontrada');
    }

    if (!stopsInput || stopsInput.length === 0) {
      return this.routeRepository.setStops(routeId, []);
    }

    this.validateUniqueCustomers(stopsInput);
    await this.validateCustomersExist(stopsInput);

    const sortedInput = [...stopsInput].sort(
      (a, b) => (a.visitOrder ?? 0) - (b.visitOrder ?? 0),
    );

    const stops = sortedInput.map((item, index) =>
      RouteStop.create({
        customerId: item.customerId,
        visitOrder: index + 1,
        suggestedTime: item.suggestedTime,
      }),
    );

    return this.routeRepository.setStops(
      routeId,
      stops.map((s) => s.toRecord()),
    );
  }

  private validateUniqueCustomers(stops: SetRouteStopInput[]): void {
    const customerIds = stops.map((s) => s.customerId);
    const uniqueIds = new Set(customerIds);
    if (uniqueIds.size !== customerIds.length) {
      throw new ResourceConflictException(
        'No se puede agregar el mismo cliente más de una vez a la ruta',
      );
    }
  }

  private async validateCustomersExist(
    stops: SetRouteStopInput[],
  ): Promise<void> {
    for (const stop of stops) {
      const exists = await this.clientReader.existsById(stop.customerId);
      if (!exists) {
        throw new EntityNotFoundException(
          `Cliente con ID ${stop.customerId} no encontrado`,
        );
      }
    }
  }
}
