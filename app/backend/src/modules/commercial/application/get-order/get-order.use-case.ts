import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Order } from '../../domain/entities/order.entity.js';
import { ORDER_REPOSITORY } from '../../domain/repositories/order-repository.port.js';
import type { IOrderRepository } from '../../domain/repositories/order-repository.port.js';

@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(id: number): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }
}
