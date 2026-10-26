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

const UNIQUE_VIOLATION = '23505';

/**
 * Inserts one row with explicit columns and returns it. Raw SQL on purpose:
 * these tables also have ORM entities in other modules, and a query builder
 * `.into('<table>')` would then expect those entities' property names and
 * silently drop snake_case keys (inserting NULLs).
 */
async function insertReturning<T>(
  manager: EntityManager,
  sql: string,
  params: unknown[],
  conflictMessage?: string,
): Promise<T> {
  try {
    const rows = (await manager.query(sql, params)) as T[];
    const row = rows[0];
    if (!row) {
      throw new Error('Insert returned no row');
    }
    return row;
  } catch (err: unknown) {
    if (
      conflictMessage &&
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: string }).code === UNIQUE_VIOLATION
    ) {
      throw new ConflictException(conflictMessage);
    }
    throw err;
  }
}

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
            const row = await insertReturning<{
              quote_id: number;
              quote_number: string;
            }>(
              manager,
              `INSERT INTO "quotes" ("quote_number", "customer_id", "sales_representative_id", "visit_id", "amount", "currency", "status", "date")
               VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE)
               RETURNING "quote_id", "quote_number"`,
              [
                input.number,
                input.clientId,
                input.advisorId ?? null,
                input.visitId ?? null,
                input.amount,
                input.currency ?? 'COP',
                input.status ?? 'ENVIADA',
              ],
              `Quotation with number ${input.number} already exists`,
            );
            return {
              id: row.quote_id,
              number: row.quote_number,
              quotationNumber: row.quote_number,
            };
          },

          saveOrder: async (input: SaveOrderTransactionalInput) => {
            const row = await insertReturning<{
              order_id: number;
              order_number: string;
            }>(
              manager,
              `INSERT INTO "orders" ("order_number", "customer_id", "sales_representative_id", "visit_id", "quote_id", "amount", "status", "date", "estimated_delivery_date")
               VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8)
               RETURNING "order_id", "order_number"`,
              [
                input.number,
                input.clientId,
                input.advisorId ?? null,
                input.visitId ?? null,
                input.quotationId ?? null,
                input.amount,
                input.status ?? 'CERRADO',
                input.estimatedDeliveryDate ?? null,
              ],
              `Order with number ${input.number} already exists`,
            );
            return {
              id: row.order_id,
              number: row.order_number,
              orderNumber: row.order_number,
            };
          },

          saveFollowUp: async (input: SaveFollowUpTransactionalInput) => {
            const row = await insertReturning<{ follow_up_id: number }>(
              manager,
              `INSERT INTO "follow_ups" ("visit_id", "responsible_sales_representative_id", "next_date", "activity", "observation", "is_completed")
               VALUES ($1, $2, $3, $4, $5, false)
               RETURNING "follow_up_id"`,
              [
                input.visitId ?? null,
                input.responsibleAdvisorId ?? null,
                input.nextContactDate,
                input.activity,
                input.observation ?? null,
              ],
            );
            return { id: row.follow_up_id };
          },

          recordHistory: async (input: RecordHistoryTransactionalInput) => {
            await insertReturning<{ customer_history_id: number }>(
              manager,
              `INSERT INTO "customer_history" ("customer_id", "action", "user", "description", "date")
               VALUES ($1, $2, $3, $4, now())
               RETURNING "customer_history_id"`,
              [input.clientId, input.action, input.user, input.description],
            );
          },
        };

        return work(context);
      },
    );
  }
}
