import type { QuotationContractDto } from '../../../../../domain-contracts/index.js';
import { Quotation } from '../../../domain/entities/quotation.entity.js';
import type { QuotationStatus } from '../../../domain/entities/quotation.entity.js';
import { QuotationOrmEntity } from '../entities/quotation.orm-entity.js';

export class QuotationMapper {
  static toDomain(orm: QuotationOrmEntity): Quotation {
    return Quotation.create({
      id: orm.id,
      number: orm.number,
      clientId: orm.clientId,
      advisorId: orm.advisorId,
      visitId: orm.visitId,
      amount: Number(orm.amount),
      currency: orm.currency,
      status: orm.status as QuotationStatus,
      date: orm.date,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: Quotation): QuotationOrmEntity {
    const orm = new QuotationOrmEntity();
    if (domain.id !== undefined) {
      orm.id = domain.id;
    }
    orm.number = domain.number;
    orm.clientId = domain.clientId;
    orm.advisorId = domain.advisorId ?? null;
    orm.visitId = domain.visitId ?? null;
    orm.amount = domain.amount;
    orm.currency = domain.currency;
    orm.status = domain.status;
    if (domain.date) {
      orm.date = domain.date;
    }
    if (domain.createdAt) {
      orm.createdAt = domain.createdAt;
    }
    return orm;
  }

  static toContract(domain: Quotation): QuotationContractDto {
    return {
      id: domain.id ?? 0,
      quotationNumber: domain.number,
      number: domain.number,
      clientId: domain.clientId,
      advisorId: domain.advisorId ?? undefined,
      visitId: domain.visitId ?? null,
      amount: domain.amount,
      currency: domain.currency,
      status: domain.status,
      date: domain.date,
      createdAt: domain.createdAt,
    };
  }
}
