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
                .into('cotizacion')
                .values({
                  numero: input.number,
                  id_cliente: input.clientId,
                  id_asesor: input.advisorId ?? null,
                  id_visita: input.visitId ?? null,
                  valor: input.amount,
                  moneda: input.currency ?? 'COP',
                  estado: input.status ?? 'DRAFT',
                })
                .returning('id_cotizacion, numero')
                .execute();
              const raw = res.raw?.[0];
              return {
                id: raw?.id_cotizacion ?? 1,
                number: raw?.numero ?? input.number,
                quotationNumber: raw?.numero ?? input.number,
              };
            } catch (err: any) {
              if (err?.code === '23505') {
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
                .into('pedido')
                .values({
                  numero: input.number,
                  id_cliente: input.clientId,
                  id_asesor: input.advisorId ?? null,
                  id_visita: input.visitId ?? null,
                  id_cotizacion: input.quotationId ?? null,
                  valor: input.amount,
                  estado: input.status ?? 'PENDING',
                  fecha_entrega_estimada: input.estimatedDeliveryDate ?? null,
                })
                .returning('id_pedido, numero')
                .execute();
              const raw = res.raw?.[0];
              return {
                id: raw?.id_pedido ?? 1,
                number: raw?.numero ?? input.number,
                orderNumber: raw?.numero ?? input.number,
              };
            } catch (err: any) {
              if (err?.code === '23505') {
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
              .into('seguimiento')
              .values({
                id_cliente: input.clientId,
                id_visita: input.visitId ?? null,
                id_asesor_responsable: input.responsibleAdvisorId ?? null,
                fecha_proxima: input.nextContactDate,
                actividad: input.activity,
                observacion: input.observation ?? null,
              })
              .returning('id_seguimiento')
              .execute();
            const raw = res.raw?.[0];
            return { id: raw?.id_seguimiento ?? 1 };
          },

          recordHistory: async (input: RecordHistoryTransactionalInput) => {
            await manager
              .createQueryBuilder()
              .insert()
              .into('historial_cliente')
              .values({
                id_cliente: input.clientId,
                id_visita: input.visitId ?? null,
                id_cotizacion: input.quotationId ?? null,
                id_pedido: input.orderId ?? null,
                accion: input.action,
                usuario: input.user,
                descripcion: input.description,
              })
              .execute();
          },
        };

        return work(context);
      },
    );
  }
}
