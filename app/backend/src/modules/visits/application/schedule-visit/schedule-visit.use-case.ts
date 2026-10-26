import { Inject, Injectable } from '@nestjs/common';
import { Visit } from '../../domain/entities/visit.entity.js';
import { VISIT_REPOSITORY } from '../../domain/repositories/visit-repository.port.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';

export interface ScheduleVisitInputDto {
  clientId: number;
  advisorId: number;
  routeId?: number | null;
  scheduledDate: Date | string;
  visitOrder?: number;
  startTime?: string;
  visitType?: string;
  objective?: string;
}

const HH_MM = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * There is no start-time column: the scheduled time lives in scheduled_at,
 * so "2026-10-25" + "09:30" becomes 2026-10-25 09:30 (server local time).
 */
function withTime(date: Date | string, startTime?: string): Date {
  const match = startTime ? HH_MM.exec(startTime) : null;
  if (typeof date === 'string') {
    const day = date.slice(0, 10);
    return match && /^\d{4}-\d{2}-\d{2}$/.test(day)
      ? new Date(`${day}T${match[1]}:${match[2]}:00`)
      : new Date(date);
  }
  const result = new Date(date);
  if (match) result.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return result;
}

@Injectable()
export class ScheduleVisitUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitRepository: IVisitRepository,
  ) {}

  async execute(dto: ScheduleVisitInputDto): Promise<Visit> {
    const scheduledDate = withTime(dto.scheduledDate, dto.startTime);

    const visit = Visit.create({
      clientId: dto.clientId,
      advisorId: dto.advisorId,
      routeId: dto.routeId ?? null,
      scheduledDate,
      visitOrder: dto.visitOrder ?? 1,
      startTime: dto.startTime ?? null,
      visitType: dto.visitType ?? 'IN_PERSON',
      objective: dto.objective ?? null,
    });

    return this.visitRepository.save(visit);
  }
}
