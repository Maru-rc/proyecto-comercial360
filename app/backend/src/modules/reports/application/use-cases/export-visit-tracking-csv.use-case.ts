import { Inject, Injectable } from '@nestjs/common';
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
  role: string;
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
  week: 'week',
  month: 'month',
  hoy: 'today',
  semana: 'week',
  'esta semana': 'week',
  mes: 'month',
  'este mes': 'month',
};

function resolvePeriod(value: string | undefined): TrackingPeriod {
  if (!value) return 'week';
  const normalized = value.trim().toLowerCase();
  return PERIOD_ALIASES[normalized] ?? 'week';
}

@Injectable()
export class ExportVisitTrackingCsvUseCase {
  constructor(
    @Inject(TRACKING_SCOPE_RESOLVER)
    private readonly scope: TrackingScopeResolver,
    @Inject(VISIT_TRACKING_REPOSITORY)
    private readonly repo: IVisitTrackingRepository,
  ) {}

  async execute(
    user: TrackingRequestUser,
    dto: VisitTrackingQueryDto,
  ): Promise<VisitTrackingRow[]> {
    const advisorId = await this.scope.execute(user, dto.asesor);

    const filter: VisitTrackingFilter = {
      period: resolvePeriod(dto.periodo),
      status: dto.estado?.trim() || null,
      routeId: dto.ruta ?? null,
      customerType: dto.tipo_cliente?.trim() || null,
      potential: dto.potencial?.trim() || null,
      advisorId,
      page: 1,
      limit: 1000000,
    };

    return this.repo.findAll(filter);
  }
}
