import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';

export interface SaveQuotationTransactionalInput {
  number: string;
  clientId: number;
  advisorId?: number | null;
  visitId?: number | null;
  amount: number;
  currency?: string;
  status?: string;
}

export interface SaveOrderTransactionalInput {
  number: string;
  clientId: number;
  advisorId?: number | null;
  visitId?: number | null;
  quotationId?: number | null;
  amount: number;
  status?: string;
  estimatedDeliveryDate?: Date | null;
}

export interface SaveFollowUpTransactionalInput {
  clientId: number;
  visitId?: number | null;
  responsibleAdvisorId?: number | null;
  nextContactDate: Date;
  activity: string;
  observation?: string | null;
}

export interface RecordHistoryTransactionalInput {
  clientId: number;
  visitId?: number | null;
  quotationId?: number | null;
  orderId?: number | null;
  action: string;
  user: string;
  description: string;
}

export interface VisitTransactionalContext {
  visitRepo: IVisitRepository;
  saveQuotation?: (
    input: SaveQuotationTransactionalInput,
  ) => Promise<{ id: number; number: string; quotationNumber?: string }>;
  saveOrder?: (
    input: SaveOrderTransactionalInput,
  ) => Promise<{ id: number; number: string; orderNumber?: string }>;
  saveFollowUp?: (
    input: SaveFollowUpTransactionalInput,
  ) => Promise<{ id: number }>;
  recordHistory?: (input: RecordHistoryTransactionalInput) => Promise<void>;
}

export interface IVisitUnitOfWork {
  runInTransaction<T>(
    work: (context: VisitTransactionalContext) => Promise<T>,
  ): Promise<T>;
}

export type VisitUnitOfWorkContext = VisitTransactionalContext;

export const VISIT_UNIT_OF_WORK = Symbol('VISIT_UNIT_OF_WORK');
