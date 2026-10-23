import { ConflictException } from '@nestjs/common';
import type {
  IVisitUnitOfWork,
  RecordHistoryTransactionalInput,
  SaveFollowUpTransactionalInput,
  SaveOrderTransactionalInput,
  SaveQuotationTransactionalInput,
  VisitTransactionalContext,
} from '../../application/ports/visit-unit-of-work.port.js';
import type { InMemoryVisitRepository } from './in-memory-visit.repository.js';

export interface QuotationRecord {
  id?: number;
  number: string;
  clientId: number;
  advisorId?: number | null;
  visitId?: number | null;
  amount: number;
  currency?: string;
  status?: string;
}

export interface OrderRecord {
  id?: number;
  number: string;
  orderNumber?: string;
  clientId: number;
  advisorId?: number | null;
  visitId?: number | null;
  quotationId?: number | null;
  amount: number;
  status?: string;
  date?: Date;
  estimatedDeliveryDate?: Date | null;
  createdAt?: Date;
}

export interface FollowUpRecord {
  id?: number;
  clientId: number;
  visitId?: number | null;
  responsibleAdvisorId?: number | null;
  nextContactDate: Date;
  activity: string;
  observation?: string | null;
}

export interface HistoryRecord {
  id?: number;
  clientId: number;
  visitId?: number | null;
  quotationId?: number | null;
  orderId?: number | null;
  action: string;
  user: string;
  description: string;
}

export interface InMemoryQuotationStore {
  findByNumber(number: string): Promise<QuotationRecord | null>;
  save(quotation: QuotationRecord): Promise<QuotationRecord>;
  getSnapshot?(): { quotations: QuotationRecord[]; autoIncrementId: number };
  restoreSnapshot?(snapshot: {
    quotations: QuotationRecord[];
    autoIncrementId: number;
  }): void;
}

export interface InMemoryOrderStore {
  findByNumber(number: string): Promise<OrderRecord | null>;
  save(order: OrderRecord): Promise<OrderRecord>;
  getSnapshot?(): { orders: OrderRecord[]; autoIncrementId: number };
  restoreSnapshot?(snapshot: {
    orders: OrderRecord[];
    autoIncrementId: number;
  }): void;
}

export interface InMemoryFollowUpStore {
  save(followUp: FollowUpRecord): Promise<FollowUpRecord>;
  getSnapshot?(): { followUps: FollowUpRecord[]; autoIncrementId: number };
  restoreSnapshot?(snapshot: {
    followUps: FollowUpRecord[];
    autoIncrementId: number;
  }): void;
}

export interface InMemoryHistoryStore {
  save(entry: HistoryRecord): Promise<HistoryRecord>;
  getSnapshot?(): { entries: HistoryRecord[]; autoIncrementId: number };
  restoreSnapshot?(snapshot: {
    entries: HistoryRecord[];
    autoIncrementId: number;
  }): void;
}

export class InMemoryVisitUnitOfWork implements IVisitUnitOfWork {
  constructor(
    private readonly visitRepo: InMemoryVisitRepository,
    private readonly quotationRepo?: InMemoryQuotationStore,
    private readonly orderRepo?: InMemoryOrderStore,
    private readonly followUpRepo?: InMemoryFollowUpStore,
    private readonly historyRepo?: InMemoryHistoryStore,
  ) {}

  async runInTransaction<T>(
    work: (context: VisitTransactionalContext) => Promise<T>,
  ): Promise<T> {
    const visitSnapshot = this.visitRepo.getSnapshot();
    const quotationSnapshot = this.quotationRepo?.getSnapshot?.();
    const orderSnapshot = this.orderRepo?.getSnapshot?.();
    const followUpSnapshot = this.followUpRepo?.getSnapshot?.();
    const historySnapshot = this.historyRepo?.getSnapshot?.();

    const context: VisitTransactionalContext = {
      visitRepo: this.visitRepo,

      saveQuotation: async (input: SaveQuotationTransactionalInput) => {
        if (this.quotationRepo) {
          const existing = await this.quotationRepo.findByNumber(input.number);
          if (existing) {
            throw new ConflictException(
              `Quotation with number ${input.number} already exists`,
            );
          }
          const saved = await this.quotationRepo.save({
            number: input.number,
            clientId: input.clientId,
            advisorId: input.advisorId,
            visitId: input.visitId,
            amount: input.amount,
            currency: input.currency ?? 'COP',
            status: input.status ?? 'DRAFT',
          });
          return {
            id: saved.id ?? 1,
            number: saved.number ?? input.number,
            quotationNumber: saved.number ?? input.number,
          };
        }
        return { id: 1, number: input.number, quotationNumber: input.number };
      },

      saveOrder: async (input: SaveOrderTransactionalInput) => {
        if (this.orderRepo) {
          const existing = await this.orderRepo.findByNumber(input.number);
          if (existing) {
            throw new ConflictException(
              `Order with number ${input.number} already exists`,
            );
          }
          const saved = await this.orderRepo.save({
            number: input.number,
            clientId: input.clientId,
            advisorId: input.advisorId,
            visitId: input.visitId,
            quotationId: input.quotationId,
            amount: input.amount,
            status: input.status ?? 'PENDING',
            estimatedDeliveryDate: input.estimatedDeliveryDate ?? null,
          });
          return {
            id: saved.id ?? 1,
            number: saved.number ?? input.number,
            orderNumber: saved.number ?? input.number,
          };
        }
        return { id: 1, number: input.number, orderNumber: input.number };
      },

      saveFollowUp: async (input: SaveFollowUpTransactionalInput) => {
        if (this.followUpRepo) {
          const saved = await this.followUpRepo.save({
            clientId: input.clientId,
            visitId: input.visitId,
            responsibleAdvisorId: input.responsibleAdvisorId,
            nextContactDate: input.nextContactDate,
            activity: input.activity,
            observation: input.observation ?? null,
          });
          return { id: saved.id ?? 1 };
        }
        return { id: 1 };
      },

      recordHistory: async (input: RecordHistoryTransactionalInput) => {
        if (this.historyRepo) {
          await this.historyRepo.save({
            clientId: input.clientId,
            visitId: input.visitId,
            quotationId: input.quotationId,
            orderId: input.orderId,
            action: input.action,
            user: input.user,
            description: input.description,
          });
        }
      },
    };

    try {
      const result = await work(context);
      return result;
    } catch (error) {
      this.visitRepo.restoreSnapshot(visitSnapshot);
      if (this.quotationRepo && quotationSnapshot) {
        this.quotationRepo.restoreSnapshot?.(quotationSnapshot);
      }
      if (this.orderRepo && orderSnapshot) {
        this.orderRepo.restoreSnapshot?.(orderSnapshot);
      }
      if (this.followUpRepo && followUpSnapshot) {
        this.followUpRepo.restoreSnapshot?.(followUpSnapshot);
      }
      if (this.historyRepo && historySnapshot) {
        this.historyRepo.restoreSnapshot?.(historySnapshot);
      }
      throw error;
    }
  }
}
