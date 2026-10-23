import type { VisitContractDto } from '../../../../../domain-contracts/index.js';
import { Visit } from '../../../domain/entities/visit.entity.js';
import type { VisitStatus } from '../../../domain/entities/visit.entity.js';
import { VisitOrmEntity } from '../entities/visit.orm-entity.js';

function parseTimeToDate(time?: string | null, baseDate?: Date): Date | null {
  if (!time) return null;
  const parsed = new Date(time);
  if (!Number.isNaN(parsed.getTime())) return parsed;
  if (baseDate && /^\d{1,2}:\d{2}(:\d{2})?$/.test(time)) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(baseDate);
    date.setUTCHours(hours, minutes, 0, 0);
    return date;
  }
  return null;
}

export class VisitMapper {
  static toDomain(orm: VisitOrmEntity): Visit {
    return Visit.create({
      id: orm.id,
      clientId: orm.clientId,
      advisorId: orm.advisorId,
      routeId: orm.routeId,
      scheduledDate: orm.scheduledDate,
      visitOrder: orm.visitOrder,
      startTime: orm.startTime,
      endTime: orm.endTime
        ? orm.endTime instanceof Date
          ? orm.endTime.toISOString()
          : String(orm.endTime)
        : null,
      visitStatus: orm.visitStatus as VisitStatus,
      visitType: orm.visitType,
      objective: orm.objective,
      observation: orm.observation,
      evidenceS3Key: orm.evidenceS3Key,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: Visit): VisitOrmEntity {
    const orm = new VisitOrmEntity();
    if (domain.id !== undefined) {
      orm.id = domain.id;
    }
    orm.clientId = domain.clientId;
    orm.advisorId = domain.advisorId;
    orm.routeId = domain.routeId ?? null;
    orm.scheduledDate = domain.scheduledDate;
    orm.visitOrder = domain.visitOrder;
    orm.startTime = domain.startTime ?? null;
    orm.endTime = parseTimeToDate(domain.endTime, domain.scheduledDate);
    orm.visitStatus = domain.visitStatus;
    orm.visitType = domain.visitType ?? null;
    orm.objective = domain.objective ?? null;
    orm.observation = domain.observation ?? null;
    orm.evidenceS3Key = domain.evidenceS3Key ?? null;
    if (domain.createdAt) {
      orm.createdAt = domain.createdAt;
    }
    return orm;
  }

  static toContract(domain: Visit): VisitContractDto {
    return {
      id: domain.id ?? 0,
      clientId: domain.clientId,
      advisorId: domain.advisorId,
      routeId: domain.routeId,
      scheduledDate: domain.scheduledDate,
      startTime: domain.startTime,
      endTime: domain.endTime,
      visitStatus: domain.visitStatus,
      status: domain.visitStatus,
      visitType: domain.visitType,
      objective: domain.objective,
      observation: domain.observation,
      observations: domain.observation,
    };
  }
}
