import type {
  OrderContractDto,
  OrderReader,
} from '../../../../domain-contracts/index.js';
import { Order } from '../../domain/entities/order.entity.js';
import type { IOrderRepository } from '../../domain/repositories/order-repository.port.js';
import type {
  CommercialPage,
  CommercialPageFilter,
} from '../../domain/repositories/commercial-page.js';
import { OrderMapper } from './mappers/order.mapper.js';

export class InMemoryOrderRepository implements IOrderRepository, OrderReader {
  private readonly orders: Order[] = [];
  private autoIncrementId = 1;

  async save(order: Order): Promise<Order> {
    const existingIndex = order.id
      ? this.orders.findIndex((o) => o.id === order.id)
      : -1;

    const id = order.id ?? this.autoIncrementId++;
    const saved = Order.create({
      id,
      number: order.number,
      clientId: order.clientId,
      advisorId: order.advisorId,
      visitId: order.visitId,
      quotationId: order.quotationId,
      amount: order.amount,
      status: order.status,
      date: order.date,
      estimatedDeliveryDate: order.estimatedDeliveryDate,
      createdAt: order.createdAt,
    });

    if (existingIndex >= 0) {
      this.orders[existingIndex] = saved;
    } else {
      this.orders.push(saved);
    }

    return saved;
  }

  async findById(id: number): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) ?? null;
  }

  async findByNumber(number: string): Promise<Order | null> {
    return this.orders.find((o) => o.number === number) ?? null;
  }

  async findByClient(clientId: number): Promise<Order[]> {
    return this.orders.filter((o) => o.clientId === clientId);
  }

  async findByVisit(visitId: number): Promise<Order[]> {
    return this.orders.filter((o) => o.visitId === visitId);
  }

  async findPage(filter: CommercialPageFilter): Promise<CommercialPage<Order>> {
    const matching = this.orders
      .filter(
        (item) =>
          filter.advisorId === null || item.advisorId === filter.advisorId,
      )
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    const start = (filter.page - 1) * filter.limit;
    return {
      items: matching.slice(start, start + filter.limit),
      total: matching.length,
    };
  }

  async findAll(): Promise<Order[]> {
    return [...this.orders];
  }

  async getOrderById(id: number): Promise<OrderContractDto | null> {
    const o = await this.findById(id);
    return o ? OrderMapper.toContract(o) : null;
  }

  async hasOrderByVisit(visitId: number): Promise<boolean> {
    return this.orders.some((o) => o.visitId === visitId);
  }

  async getOrdersByVisit(visitId: number): Promise<OrderContractDto[]> {
    const list = await this.findByVisit(visitId);
    return list.map((o) => OrderMapper.toContract(o));
  }

  clear(): void {
    this.orders.length = 0;
    this.autoIncrementId = 1;
  }
}
