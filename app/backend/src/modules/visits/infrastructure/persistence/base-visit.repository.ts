import type {
  ClientReader,
  VisitAgendaItemContractDto,
  VisitContractDto,
  VisitMapStopContractDto,
  VisitReader,
} from '../../../../domain-contracts/index.js';
import type { VisitOutcome } from '../../domain/entities/visit-outcome.entity.js';
import type { Visit } from '../../domain/entities/visit.entity.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';
import { VisitMapper } from './mappers/visit.mapper.js';

export abstract class BaseVisitRepository
  implements IVisitRepository, VisitReader
{
  protected constructor(protected readonly clientReader?: ClientReader) {}

  abstract save(visit: Visit): Promise<Visit>;
  abstract findById(id: number): Promise<Visit | null>;
  abstract findByAdvisorAndDate(
    advisorId: number,
    date: string,
  ): Promise<Visit[]>;
  abstract findByDate(date: string): Promise<Visit[]>;
  abstract findAll(): Promise<Visit[]>;
  abstract saveOutcome(outcome: VisitOutcome): Promise<VisitOutcome>;
  abstract findOutcomeByVisit(visitId: number): Promise<VisitOutcome | null>;

  async getVisitById(id: number): Promise<VisitContractDto | null> {
    const visit = await this.findById(id);
    return visit ? VisitMapper.toContract(visit) : null;
  }

  async getDailyAgenda(
    date: string,
    advisorId?: number,
  ): Promise<VisitAgendaItemContractDto[]> {
    const visits = advisorId
      ? await this.findByAdvisorAndDate(advisorId, date)
      : await this.findByDate(date);
    return VisitMapper.toDailyAgenda(visits, this.clientReader);
  }

  async getMapStops(
    date: string,
    advisorId?: number,
  ): Promise<VisitMapStopContractDto[]> {
    const agenda = await this.getDailyAgenda(date, advisorId);
    return VisitMapper.toMapStops(agenda);
  }
}
