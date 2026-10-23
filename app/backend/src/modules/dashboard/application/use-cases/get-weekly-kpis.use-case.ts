import { Inject, Injectable } from '@nestjs/common';
import {
  ADVISOR_SCOPE_RESOLVER,
  type AdvisorScopeResolver,
  USER_ROLES,
  type Role,
} from '../../../../domain-contracts/index.js';
import { DASHBOARD_REPOSITORY } from '../ports/dashboard.repository.port.js';
import type { IDashboardRepository } from '../ports/dashboard.repository.port.js';
import { WeeklyKpisQueryDto } from '../dtos/weekly-kpis-query.dto.js';
import { WeeklyKpisResponseDto } from '../dtos/weekly-kpis-response.dto.js';

export interface KpiRequestUser {
  id: string;
  email: string;
  role: Role | 'ASESOR';
}

function resolveWeekBounds(isoWeek: string): [Date, Date] {
  const [yearStr, weekStr] = isoWeek.split('-W');
  const year = Number.parseInt(yearStr, 10);
  const week = Number.parseInt(weekStr, 10);

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1) + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

  return [weekStart, weekEnd];
}

function currentIsoWeek(): string {
  const now = new Date();
  const jan4 = new Date(Date.UTC(now.getUTCFullYear(), 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const firstMonday = new Date(jan4);
  firstMonday.setUTCDate(jan4.getUTCDate() - (dayOfWeek - 1));
  const diff = now.getTime() - firstMonday.getTime();
  const week = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return `${now.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

@Injectable()
export class GetWeeklyKpisUseCase {
  constructor(
    @Inject(ADVISOR_SCOPE_RESOLVER)
    private readonly scope: AdvisorScopeResolver,
    @Inject(DASHBOARD_REPOSITORY)
    private readonly repo: IDashboardRepository,
  ) {}

  async execute(
    user: KpiRequestUser,
    dto: WeeklyKpisQueryDto,
  ): Promise<WeeklyKpisResponseDto> {
    const week = dto.week ?? dto.semana ?? currentIsoWeek();
    const [weekStart, weekEnd] = resolveWeekBounds(week);
    const normalizedRole =
      user.role === 'ASESOR' ? USER_ROLES.ADVISOR : user.role;
    const advisorId = await this.scope.execute({
      ...user,
      role: normalizedRole,
    });
    const zone = dto.zone ?? dto.zona ?? null;
    const zoneId = user.role === USER_ROLES.DIRECTOR ? zone : null;

    const raw = await this.repo.getWeeklyKpis({
      weekStart,
      weekEnd,
      asesorId: advisorId,
      zoneId,
    });

    const effectivenessRate =
      raw.visits.scheduled > 0
        ? Math.round((raw.visits.completed / raw.visits.scheduled) * 1000) / 10
        : 0;

    const target =
      raw.weeklyTarget > 0 ? raw.weeklyTarget : raw.visits.scheduled;
    const percentage =
      target > 0 ? Math.round((raw.visits.completed / target) * 1000) / 10 : 0;

    return {
      week,
      scheduledVisits: raw.visits.scheduled,
      completedVisits: raw.visits.completed,
      effectivenessRate,
      quotedValue: raw.quotedValue,
      closedOrders: raw.orders.closedOrders,
      routeBilling: raw.orders.billing,
      weeklyGoal: {
        target,
        completed: raw.visits.completed,
        percentage,
      },
    };
  }
}
