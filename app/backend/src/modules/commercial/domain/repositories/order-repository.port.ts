import type { Order } from '../entities/order.entity.js';

export interface IOrderRepository {
  save(order: Order): Promise<Order>;
  findById(id: number): Promise<Order | null>;
  findByNumber(number: string): Promise<Order | null>;
  findByClient(clientId: number): Promise<Order[]>;
  findByVisit(visitId: number): Promise<Order[]>;
  findAll(): Promise<Order[]>;
}

export const ORDER_REPOSITORY = Symbol('ORDER_REPOSITORY');
