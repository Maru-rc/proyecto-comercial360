import { ConflictException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import type { EntityManager } from 'typeorm';
import type {
  IVisitUnitOfWork,
  RecordHistoryTransactionalInput,
  SaveFollowUpTransactionalInput,
  SaveOrderTransactionalInput,
  SaveQuotationTransactionalInput,
  VisitTransactionalContext,
} from '../../application/ports/visit-unit-of-work.port.js';
import { VisitOutcomeOrmEntity } from './entities/visit-outcome.orm-entity.js';
import { VisitOrmEntity } from './entities/visit.orm-entity.js';
import { TypeOrmVisitRepository } from './typeorm-visit.repository.js';

@Injectable()
export class TypeOrmVisitUnitOfWork implements IVisitUnitOfWork {
  constructor(private readonly dataSource: DataSource) {}

  async runInTransaction<T>(
    work: (context: VisitTransactionalContext) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(
      'READ COMMITTED',
      async (manager: EntityManager) => {
        const visitRepo = new TypeOrmVisitRepository(
          manager.getRepository(VisitOrmEntity),
          manager.getRepository(VisitOutcomeOrmEntity),
        );

        const context: VisitTransactionalContext = {
          visitRepo,

          saveQuotation: async (input: SaveQuotationTransactionalInput) => {
            try {
              const res = await manager
                .createQueryBuilder()
                .insert()
                .into('quotes')
                .values({
                  quote_number: input.number,
                  customer_id: input.clientId,
                  sales_representative_id: input.advisorId ?? null,
                  amount: input.amount,
                  currency: input.currency ?? 'COP',
                  status: input.status ?? 'ENVIADA',
                  date: new Date(),
                })
                .returning('quote_id, quote_number')
                .execute();
              const raw = res.raw?.[0];
              return {
                id: raw?.quote_id ?? 1,
                number: raw?.quote_number ?? input.number,
                quotationNumber: raw?.quote_number ?? input.number,
              };
            } catch (err: unknown) {
              if (
                typeof err === 'object' &&
                err !== null &&
                'code' in err &&
                (err as { code: string }).code === '23505'
              ) {
                throw new ConflictException(
                  `Quotation with number ${input.number} already exists`,
                );
              }
              throw err;
            }
          },

          saveOrder: async (input: SaveOrderTransactionalInput) => {
            try {
              const res = await manager
                .createQueryBuilder()
                .insert()
                .into('orders')
                .values({
                  order_number: input.number,
                  customer_id: input.clientId,
                  quote_id: input.quotationId ?? null,
                  amount: input.amount,
                  status: input.status ?? 'CERRADO',
                  date: new Date(),
                  estimated_delivery_date: input.estimatedDeliveryDate ?? null,
                })
                .returning('order_id, order_number')
                .execute();
              const raw = res.raw?.[0];
              return {
                id: raw?.order_id ?? 1,
                number: raw?.order_number ?? input.number,
                orderNumber: raw?.order_number ?? input.number,
              };
            } catch (err: unknown) {
              if (
                typeof err === 'object' &&
                err !== null &&
                'code' in err &&
                (err as { code: string }).code === '23505'
              ) {
                throw new ConflictException(
                  `Order with number ${input.number} already exists`,
                );
              }
              throw err;
            }
          },

          saveFollowUp: async (input: SaveFollowUpTransactionalInput) => {
            const res = await manager
              .createQueryBuilder()
              .insert()
              .into('follow_ups')
              .values({
                visit_id: input.visitId ?? null,
                responsible_sales_representative_id:
                  input.responsibleAdvisorId ?? null,
                next_date: input.nextContactDate,
                activity: input.activity,
                observation: input.observation ?? null,
                is_completed: false,
              })
              .returning('follow_up_id')
              .execute();
            const raw = res.raw?.[0];
            return { id: raw?.follow_up_id ?? 1 };
          },

          recordHistory: async (input: RecordHistoryTransactionalInput) => {
            await manager
              .createQueryBuilder()
              .insert()
              .into('customer_history')
              .values({
                customer_id: input.clientId,
                action: input.action,
                user: input.user,
                description: input.description,
                date: new Date(),
              })
              .execute();
          },
        };

        return work(context);
      },
    );
  }
}
