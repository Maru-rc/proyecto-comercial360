import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  OrderContractDto,
  OrderReader,
} from '../../../../domain-contracts/index.js';
import type { Order } from '../../domain/entities/order.entity.js';
import type { IOrderRepository } from '../../domain/repositories/order-repository.port.js';
import type {
  CommercialPage,
  CommercialPageFilter,
} from '../../domain/repositories/commercial-page.js';
import { OrderOrmEntity } from './entities/order.orm-entity.js';
import { OrderMapper } from './mappers/order.mapper.js';

@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository, OrderReader {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repository: Repository<OrderOrmEntity>,
  ) {}

  async save(order: Order): Promise<Order> {
    const orm = OrderMapper.toOrm(order);
    const saved = await this.repository.save(orm);
    return OrderMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Order | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? OrderMapper.toDomain(entity) : null;
  }

  async findByNumber(number: string): Promise<Order | null> {
    const entity = await this.repository.findOne({ where: { number } });
    return entity ? OrderMapper.toDomain(entity) : null;
  }

  async findByClient(clientId: number): Promise<Order[]> {
    const list = await this.repository.find({
      where: { clientId },
      order: { date: 'DESC' },
    });
    return list.map((item) => OrderMapper.toDomain(item));
  }

  async findByVisit(visitId: number): Promise<Order[]> {
    const list = await this.repository.find({
      where: { visitId },
      order: { date: 'DESC' },
    });
    return list.map((item) => OrderMapper.toDomain(item));
  }

  async findPage(filter: CommercialPageFilter): Promise<CommercialPage<Order>> {
    const [list, total] = await this.repository.findAndCount({
      where: filter.advisorId === null ? {} : { advisorId: filter.advisorId },
      order: { date: 'DESC', id: 'DESC' },
      skip: (filter.page - 1) * filter.limit,
      take: filter.limit,
    });
    return { items: list.map((item) => OrderMapper.toDomain(item)), total };
  }

  async findAll(): Promise<Order[]> {
    const list = await this.repository.find({
      order: { date: 'DESC' },
    });
    return list.map((item) => OrderMapper.toDomain(item));
  }

  async getOrderById(id: number): Promise<OrderContractDto | null> {
    const order = await this.findById(id);
    return order ? OrderMapper.toContract(order) : null;
  }

  async hasOrderByVisit(visitId: number): Promise<boolean> {
    const count = await this.repository.count({ where: { visitId } });
    return count > 0;
  }

  async getOrdersByVisit(visitId: number): Promise<OrderContractDto[]> {
    const orders = await this.findByVisit(visitId);
    return orders.map((o) => OrderMapper.toContract(o));
  }
}
