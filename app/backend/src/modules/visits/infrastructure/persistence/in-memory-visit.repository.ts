import type {
  ClientReader,
  VisitAgendaItemContractDto,
  VisitContractDto,
  VisitMapStopContractDto,
  VisitReader,
} from '../../../../domain-contracts/index.js';
import { VisitOutcome } from '../../domain/entities/visit-outcome.entity.js';
import { Visit } from '../../domain/entities/visit.entity.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';
import { VisitMapper } from './mappers/visit.mapper.js';

export class InMemoryVisitRepository implements IVisitRepository, VisitReader {
  private readonly visits: Visit[] = [];
  private readonly outcomes: VisitOutcome[] = [];
  private autoIncrementId = 1;
  private autoIncrementOutcomeId = 1;

  constructor(private readonly clientReader?: ClientReader) {}

  getSnapshot(): {
    visits: Visit[];
    outcomes: VisitOutcome[];
    autoIncrementId: number;
    autoIncrementOutcomeId: number;
  } {
    return {
      visits: this.visits.map((v) =>
        Visit.create({
          id: v.id,
          clientId: v.clientId,
          advisorId: v.advisorId,
          routeId: v.routeId,
          scheduledDate: new Date(v.scheduledDate),
          visitOrder: v.visitOrder,
          startTime: v.startTime,
          endTime: v.endTime,
          visitStatus: v.visitStatus,
          visitType: v.visitType,
          objective: v.objective,
          observation: v.observation,
          evidenceS3Key: v.evidenceS3Key,
          createdAt: v.createdAt ? new Date(v.createdAt) : undefined,
        }),
      ),
      outcomes: this.outcomes.map((o) =>
        VisitOutcome.create({
          id: o.id,
          visitId: o.visitId,
          outcome: o.outcome,
          reasonNoSale: o.reasonNoSale,
          observations: o.observations,
          evidenceS3Key: o.evidenceS3Key,
          createdAt: o.createdAt ? new Date(o.createdAt) : undefined,
        }),
      ),
      autoIncrementId: this.autoIncrementId,
      autoIncrementOutcomeId: this.autoIncrementOutcomeId,
    };
  }

  restoreSnapshot(snapshot: {
    visits: Visit[];
    outcomes: VisitOutcome[];
    autoIncrementId: number;
    autoIncrementOutcomeId: number;
  }): void {
    this.visits.length = 0;
    this.visits.push(...snapshot.visits);
    this.outcomes.length = 0;
    this.outcomes.push(...snapshot.outcomes);
    this.autoIncrementId = snapshot.autoIncrementId;
    this.autoIncrementOutcomeId = snapshot.autoIncrementOutcomeId;
  }

  async save(visit: Visit): Promise<Visit> {
    const existingIndex = visit.id
      ? this.visits.findIndex((v) => v.id === visit.id)
      : -1;

    const id = visit.id ?? this.autoIncrementId++;
    const saved = Visit.create({
      id,
      clientId: visit.clientId,
      advisorId: visit.advisorId,
      routeId: visit.routeId,
      scheduledDate: visit.scheduledDate,
      visitOrder: visit.visitOrder,
      startTime: visit.startTime,
      endTime: visit.endTime,
      visitStatus: visit.visitStatus,
      visitType: visit.visitType,
      objective: visit.objective,
      observation: visit.observation,
      evidenceS3Key: visit.evidenceS3Key,
      createdAt: visit.createdAt,
    });

    if (existingIndex >= 0) {
      this.visits[existingIndex] = saved;
    } else {
      this.visits.push(saved);
    }

    return saved;
  }

  async findById(id: number): Promise<Visit | null> {
    return this.visits.find((v) => v.id === id) ?? null;
  }

  async findByAdvisorAndDate(
    advisorId: number,
    date: string,
  ): Promise<Visit[]> {
    return this.visits
      .filter((v) => {
        const vDate = v.scheduledDate.toISOString().split('T')[0];
        return v.advisorId === advisorId && vDate === date;
      })
      .sort((a, b) => a.visitOrder - b.visitOrder);
  }

  async findByDate(date: string): Promise<Visit[]> {
    return this.visits
      .filter((v) => {
        const vDate = v.scheduledDate.toISOString().split('T')[0];
        return vDate === date;
      })
      .sort((a, b) => a.visitOrder - b.visitOrder);
  }

  async findAll(): Promise<Visit[]> {
    return [...this.visits];
  }

  async saveOutcome(outcome: VisitOutcome): Promise<VisitOutcome> {
    const id = outcome.id ?? this.autoIncrementOutcomeId++;
    const saved = VisitOutcome.create({
      id,
      visitId: outcome.visitId,
      outcome: outcome.outcome,
      reasonNoSale: outcome.reasonNoSale,
      observations: outcome.observations,
      evidenceS3Key: outcome.evidenceS3Key,
      createdAt: outcome.createdAt,
    });
    this.outcomes.push(saved);
    return saved;
  }

  async findOutcomeByVisit(visitId: number): Promise<VisitOutcome | null> {
    return this.outcomes.find((o) => o.visitId === visitId) ?? null;
  }

  async getVisitById(id: number): Promise<VisitContractDto | null> {
    const v = await this.findById(id);
    return v ? VisitMapper.toContract(v) : null;
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

  clear(): void {
    this.visits.length = 0;
    this.outcomes.length = 0;
    this.autoIncrementId = 1;
    this.autoIncrementOutcomeId = 1;
  }
}
