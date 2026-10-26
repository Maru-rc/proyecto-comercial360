import { Inject, Injectable } from '@nestjs/common';
import type {
  RouteRecord,
  RouteRepository,
} from '../ports/route.repository.port.js';
import { ROUTE_REPOSITORY } from '../ports/route.repository.port.js';

@Injectable()
export class ListRoutesUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routeRepo: RouteRepository,
  ) {}

  async execute(): Promise<RouteRecord[]> {
    return this.routeRepo.findAll();
  }
}
