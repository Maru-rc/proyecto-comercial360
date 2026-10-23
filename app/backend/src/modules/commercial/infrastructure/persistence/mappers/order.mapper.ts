import type { OrderContractDto } from '../../../../../domain-contracts/index.js';
import { Order } from '../../../domain/entities/order.entity.js';
import type { OrderStatus } from '../../../domain/entities/order.entity.js';
import { OrderOrmEntity } from '../entities/order.orm-entity.js';

export class OrderMapper {
  static toDomain(orm: OrderOrmEntity): Order {
    return Order.create({
      id: orm.id,
      number: orm.number,
      clientId: orm.clientId,
      advisorId: orm.advisorId,
      visitId: orm.visitId,
      quotationId: orm.quotationId,
      amount: Number(orm.amount),
      status: orm.status as OrderStatus,
      date: orm.date,
      estimatedDeliveryDate: orm.estimatedDeliveryDate,
      createdAt: orm.createdAt,
    });
  }

  static toOrm(domain: Order): OrderOrmEntity {
    const orm = new OrderOrmEntity();
    if (domain.id !== undefined) {
      orm.id = domain.id;
    }
    orm.number = domain.number;
    orm.clientId = domain.clientId;
    orm.advisorId = domain.advisorId ?? null;
    orm.visitId = domain.visitId ?? null;
    orm.quotationId = domain.quotationId ?? null;
    orm.amount = domain.amount;
    orm.status = domain.status;
    if (domain.date) {
      orm.date = domain.date;
    }
    orm.estimatedDeliveryDate = domain.estimatedDeliveryDate ?? null;
    if (domain.createdAt) {
      orm.createdAt = domain.createdAt;
    }
    return orm;
  }

  static toContract(domain: Order): OrderContractDto {
    return {
      id: domain.id ?? 0,
      orderNumber: domain.number,
      number: domain.number,
      clientId: domain.clientId,
      advisorId: domain.advisorId ?? undefined,
      visitId: domain.visitId ?? null,
      quotationId: domain.quotationId ?? null,
      amount: domain.amount,
      status: domain.status,
      date: domain.date,
      estimatedDeliveryDate: domain.estimatedDeliveryDate,
      createdAt: domain.createdAt,
    };
  }
}
