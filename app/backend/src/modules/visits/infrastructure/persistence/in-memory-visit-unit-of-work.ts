import { ConflictException } from '@nestjs/common';
import { Visit } from '../../domain/entities/visit.entity.js';
import type {
  IVisitUnitOfWork,
  RecordHistoryTransactionalInput,
  SaveFollowUpTransactionalInput,
  SaveOrderTransactionalInput,
  SaveQuotationTransactionalInput,
  VisitTransactionalContext,
} from '../../application/ports/visit-unit-of-work.port.js';
import type { InMemoryVisitRepository } from './in-memory-visit.repository.js';

export interface InMemoryQuotationStore {
  findByNumber(number: string): Promise<any>;
  save(quotation: any): Promise<any>;
}

export interface InMemoryOrderStore {
  findByNumber(number: string): Promise<any>;
  save(order: any): Promise<any>;
}

export interface InMemoryFollowUpStore {
  save(followUp: any): Promise<any>;
}

export interface InMemoryHistoryStore {
  save(entry: any): Promise<any>;
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
    // 1. SNAPSHOT: Deep copy repository states
    const visitSnapshot = {
      visits: ((this.visitRepo as any).visits ?? []).map((v: any) =>
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
          createdAt: v.createdAt,
        }),
      ),
      outcomes: [...((this.visitRepo as any).outcomes ?? [])],
      autoIncrementId: (this.visitRepo as any).autoIncrementId ?? 1,
      autoIncrementOutcomeId:
        (this.visitRepo as any).autoIncrementOutcomeId ?? 1,
    };
    const quotationSnapshot = {
      quotations: this.quotationRepo
        ? [...((this.quotationRepo as any).quotations ?? [])]
        : [],
      autoIncrementId: this.quotationRepo
        ? ((this.quotationRepo as any).autoIncrementId ?? 1)
        : 1,
    };
    const orderSnapshot = {
      orders: this.orderRepo ? [...((this.orderRepo as any).orders ?? [])] : [],
      autoIncrementId: this.orderRepo
        ? ((this.orderRepo as any).autoIncrementId ?? 1)
        : 1,
    };
    const followUpSnapshot = {
      followUps: this.followUpRepo
        ? [...((this.followUpRepo as any).followUps ?? [])]
        : [],
      autoIncrementId: this.followUpRepo
        ? ((this.followUpRepo as any).autoIncrementId ?? 1)
        : 1,
    };
    const historySnapshot = {
      entries: this.historyRepo
        ? [...((this.historyRepo as any).entries ?? [])]
        : [],
      autoIncrementId: this.historyRepo
        ? ((this.historyRepo as any).autoIncrementId ?? 1)
        : 1,
    };

    // 2. CONTEXT: Construct transactional delegates with constraint checks
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

    // 3. EXECUTE & ROLLBACK ON FAILURE
    try {
      const result = await work(context);
      return result;
    } catch (error) {
      // ROLLBACK: Restore original snapshot in all repositories
      if ((this.visitRepo as any).visits) {
        (this.visitRepo as any).visits.length = 0;
        (this.visitRepo as any).visits.push(...visitSnapshot.visits);
        (this.visitRepo as any).outcomes.length = 0;
        (this.visitRepo as any).outcomes.push(...visitSnapshot.outcomes);
        (this.visitRepo as any).autoIncrementId = visitSnapshot.autoIncrementId;
        (this.visitRepo as any).autoIncrementOutcomeId =
          visitSnapshot.autoIncrementOutcomeId;
      }
      if (this.quotationRepo && (this.quotationRepo as any).quotations) {
        (this.quotationRepo as any).quotations.length = 0;
        (this.quotationRepo as any).quotations.push(
          ...quotationSnapshot.quotations,
        );
        (this.quotationRepo as any).autoIncrementId =
          quotationSnapshot.autoIncrementId;
      }
      if (this.orderRepo && (this.orderRepo as any).orders) {
        (this.orderRepo as any).orders.length = 0;
        (this.orderRepo as any).orders.push(...orderSnapshot.orders);
        (this.orderRepo as any).autoIncrementId = orderSnapshot.autoIncrementId;
      }
      if (this.followUpRepo && (this.followUpRepo as any).followUps) {
        (this.followUpRepo as any).followUps.length = 0;
        (this.followUpRepo as any).followUps.push(
          ...followUpSnapshot.followUps,
        );
        (this.followUpRepo as any).autoIncrementId =
          followUpSnapshot.autoIncrementId;
      }
      if (this.historyRepo && (this.historyRepo as any).entries) {
        (this.historyRepo as any).entries.length = 0;
        (this.historyRepo as any).entries.push(...historySnapshot.entries);
        (this.historyRepo as any).autoIncrementId =
          historySnapshot.autoIncrementId;
      }

      throw error;
    }
  }
}
