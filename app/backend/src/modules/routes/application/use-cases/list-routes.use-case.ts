import { Inject, Injectable, Optional } from '@nestjs/common';
import type {
  RouteRecord,
  RouteRepository,
} from '../ports/route.repository.port.js';
import { ROUTE_REPOSITORY } from '../ports/route.repository.port.js';
import { ROUTES_ADVISOR_SCOPE } from '../ports/advisor-scope-resolver.port.js';
import type {
  AdvisorScopeResolver,
  RouteRequester,
} from '../ports/advisor-scope-resolver.port.js';

/** Routes the requester may see: an advisor only the ones assigned to them. */
@Injectable()
export class ListRoutesUseCase {
  constructor(
    @Inject(ROUTE_REPOSITORY)
    private readonly routeRepo: RouteRepository,
    @Optional()
    @Inject(ROUTES_ADVISOR_SCOPE)
    private readonly advisorScope?: AdvisorScopeResolver,
  ) {}

  async execute(requester?: RouteRequester): Promise<RouteRecord[]> {
    const advisorId =
      requester && this.advisorScope
        ? await this.advisorScope.execute(requester)
        : null;
    return this.routeRepo.findAll(advisorId === null ? {} : { advisorId });
  }
}
