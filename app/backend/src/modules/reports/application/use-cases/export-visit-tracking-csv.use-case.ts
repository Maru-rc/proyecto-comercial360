import { Inject, Injectable } from '@nestjs/common';
import { VisitTrackingQueryDto } from '../dtos/visit-tracking-query.dto.js';
import {
  VISIT_TRACKING_REPOSITORY,
  type IVisitTrackingRepository,
  type VisitTrackingFilter,
  type VisitTrackingRow,
} from '../ports/visit-tracking.port.js';
import { resolveVisitTrackingPeriod } from './visit-tracking-period.util.js';

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
    const filter = this.buildFilter(dto, advisorId);

    return this.repo.findAll(filter);
  }

  private buildFilter(
    dto: VisitTrackingQueryDto,
    advisorId: number | null,
  ): VisitTrackingFilter {
    return {
      period: resolveVisitTrackingPeriod(dto.periodo),
      status: dto.estado?.trim() || null,
      routeId: dto.ruta ?? null,
      customerType: dto.tipo_cliente?.trim() || null,
      potential: dto.potencial?.trim() || null,
      advisorId,
      page: 1,
      limit: 1000000,
    };
  }
}
