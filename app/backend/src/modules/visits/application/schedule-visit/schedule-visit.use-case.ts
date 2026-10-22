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

@Injectable()
export class ScheduleVisitUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitRepository: IVisitRepository,
  ) {}

  async execute(dto: ScheduleVisitInputDto): Promise<Visit> {
    const scheduledDate =
      typeof dto.scheduledDate === 'string'
        ? new Date(dto.scheduledDate)
        : dto.scheduledDate;

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
