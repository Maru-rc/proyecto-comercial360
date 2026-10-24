import { Inject, Injectable } from '@nestjs/common';
import { Route } from '../../domain/entities/route.entity.js';
import {
  ROUTE_REPOSITORY,
  type RouteRepository,
  type RouteRecord,
} from '../ports/route.repository.port.js';

export interface CreateRouteCommand {
  name: string;
  zoneId: number;
  executionDay: string;
  frequency: string;
  startTime?: string | null;
  endTime?: string | null;
  description?: string | null;
}

@Injectable()
export class CreateRouteUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routeRepository: RouteRepository,
  ) {}

  async execute(command: CreateRouteCommand): Promise<RouteRecord> {
    const route = Route.create({
      name: command.name,
      zoneId: command.zoneId,
      executionDay: command.executionDay,
      frequency: command.frequency,
      startTime: command.startTime,
      endTime: command.endTime,
      description: command.description,
    });

    return this.routeRepository.save({
      name: route.name,
      zoneId: route.zoneId,
      executionDay: route.executionDay,
      frequency: route.frequency,
      startTime: route.startTime,
      endTime: route.endTime,
      description: route.description,
      status: route.status,
    });
  }
}
