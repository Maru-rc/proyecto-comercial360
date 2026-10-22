import type { VisitOutcome } from '../entities/visit-outcome.entity.js';
import type { Visit } from '../entities/visit.entity.js';

export interface IVisitRepository {
  save(visit: Visit): Promise<Visit>;
  findById(id: number): Promise<Visit | null>;
  findByAdvisorAndDate(advisorId: number, date: string): Promise<Visit[]>;
  findByDate(date: string): Promise<Visit[]>;
  findAll(): Promise<Visit[]>;
  saveOutcome(outcome: VisitOutcome): Promise<VisitOutcome>;
  findOutcomeByVisit(visitId: number): Promise<VisitOutcome | null>;
}

export const VISIT_REPOSITORY = Symbol('VISIT_REPOSITORY');
