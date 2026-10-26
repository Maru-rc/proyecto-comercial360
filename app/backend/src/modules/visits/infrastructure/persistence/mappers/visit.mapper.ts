import type {
  ClientReader,
  VisitAgendaItemContractDto,
  VisitContractDto,
  VisitMapStopContractDto,
} from '../../../../../domain-contracts/index.js';
import { Visit } from '../../../domain/entities/visit.entity.js';
import type { VisitStatus } from '../../../domain/entities/visit.entity.js';
import { VisitOutcome } from '../../../domain/entities/visit-outcome.entity.js';
import type { OutcomeType } from '../../../domain/entities/visit-outcome.entity.js';
import { VisitOrmEntity } from '../entities/visit.orm-entity.js';
import { VisitOutcomeOrmEntity } from '../entities/visit-outcome.orm-entity.js';

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

/** "HH:mm" of a scheduled timestamp; null for a date-only (midnight) visit. */
function timeOfDay(date: Date | null | undefined): string | null {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  if (date.getHours() === 0 && date.getMinutes() === 0) return null;
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
      startTime: orm.startTime ?? timeOfDay(orm.scheduledDate),
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

  static async toDailyAgenda(
    visits: Visit[],
    clientReader?: ClientReader,
  ): Promise<VisitAgendaItemContractDto[]> {
    return Promise.all(
      visits.map(async (v) => {
        const clientSummary = clientReader
          ? await clientReader.getSummaryById(v.clientId)
          : null;
        const coords = clientReader
          ? await clientReader.getCoordinatesById(v.clientId)
          : null;

        return {
          id: v.id ?? 0,
          clientId: v.clientId,
          clientName: clientSummary?.legalName ?? `Client #${v.clientId}`,
          clientAddress: clientSummary?.address ?? null,
          address: clientSummary?.address ?? null,
          visitOrder: v.visitOrder,
          order: v.visitOrder,
          suggestedTime: v.startTime,
          time: v.startTime ?? undefined,
          visitStatus: v.visitStatus,
          status: v.visitStatus,
          objective: v.objective,
          latitude: coords?.latitude ?? null,
          longitude: coords?.longitude ?? null,
          primaryContact: clientSummary?.primaryContact
            ? {
                name: clientSummary.primaryContact.name,
                phone: clientSummary.primaryContact.phone,
              }
            : null,
        };
      }),
    );
  }

  static toMapStops(
    agenda: VisitAgendaItemContractDto[],
  ): VisitMapStopContractDto[] {
    return agenda.map((item) => ({
      id: item.id,
      clientId: item.clientId,
      clientName: item.clientName,
      address: item.clientAddress ?? null,
      order: item.visitOrder,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      pinStatus: item.visitStatus === 'COMPLETED' ? 'VISITED' : 'PENDING',
    }));
  }

  static outcomeToDomain(orm: VisitOutcomeOrmEntity): VisitOutcome {
    return VisitOutcome.create({
      id: orm.id,
      visitId: orm.visitId,
      outcome: orm.outcome as OutcomeType,
      reasonNoSale: orm.reasonNoSale,
      observations: orm.observations,
      evidenceS3Key: orm.evidenceS3Key,
      createdAt: orm.createdAt,
    });
  }

  static outcomeToOrm(domain: VisitOutcome): VisitOutcomeOrmEntity {
    const orm = new VisitOutcomeOrmEntity();
    if (domain.id !== undefined) {
      orm.id = domain.id;
    }
    orm.visitId = domain.visitId;
    orm.outcome = domain.outcome;
    orm.reasonNoSale = domain.reasonNoSale ?? null;
    orm.observations = domain.observations ?? null;
    orm.evidenceS3Key = domain.evidenceS3Key ?? null;
    return orm;
  }
}
