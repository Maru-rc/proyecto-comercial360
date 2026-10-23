import { Inject, Injectable } from '@nestjs/common';
import { createPaginatedResult } from '../../../../domain-contracts/index.js';
import type { PaginatedResult } from '../../../../domain-contracts/index.js';
import type { Role } from '../../../../domain-contracts/auth/index.js';
import { VisitTrackingQueryDto } from '../dtos/visit-tracking-query.dto.js';
import {
  VISIT_TRACKING_REPOSITORY,
  type IVisitTrackingRepository,
  type TrackingPeriod,
  type VisitTrackingFilter,
  type VisitTrackingRow,
} from '../ports/visit-tracking.port.js';

export interface TrackingRequestUser {
  id: string;
  email: string;
  role: Role;
}

export interface TrackingScopeResolver {
  execute(
    user: TrackingRequestUser,
    requestedId?: number,
  ): Promise<number | null>;
}

export const TRACKING_SCOPE_RESOLVER = Symbol('TRACKING_SCOPE_RESOLVER');

const PERIOD_ALIASES: Record<string, TrackingPeriod> = {
  today: 'today',
  hoy: 'today',
  week: 'week',
  semana: 'week',
  'esta semana': 'week',
  month: 'month',
  mes: 'month',
  'este mes': 'month',
};

function resolvePeriod(value: string | undefined): TrackingPeriod {
  if (!value) return 'week';
  return PERIOD_ALIASES[value.toLowerCase()] ?? 'week';
}

@Injectable()
export class GetVisitTrackingUseCase {
  constructor(
    @Inject(TRACKING_SCOPE_RESOLVER)
    private readonly scope: TrackingScopeResolver,
    @Inject(VISIT_TRACKING_REPOSITORY)
    private readonly repo: IVisitTrackingRepository,
  ) {}

  async execute(
    user: TrackingRequestUser,
    dto: VisitTrackingQueryDto,
  ): Promise<PaginatedResult<VisitTrackingRow>> {
    const advisorId = await this.scope.execute(user, dto.asesor);
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;

    const filter: VisitTrackingFilter = {
      period: resolvePeriod(dto.periodo),
      status: dto.estado?.trim() || null,
      routeId: dto.ruta ?? null,
      customerType: dto.tipo_cliente?.trim() || null,
      potential: dto.potencial?.trim() || null,
      advisorId,
      page,
      limit,
    };

    const { rows, total } = await this.repo.findPage(filter);

    return createPaginatedResult(rows, total, page, limit);
  }
}
