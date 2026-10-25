import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ForbiddenOperationException } from '../../../../domain-contracts/index.js';
import type { Order } from '../../domain/entities/order.entity.js';
import { ORDER_REPOSITORY } from '../../domain/repositories/order-repository.port.js';
import type { IOrderRepository } from '../../domain/repositories/order-repository.port.js';
import { COMMERCIAL_ADVISOR_SCOPE } from '../ports/advisor-scope-resolver.port.js';
import type {
  AdvisorScopeResolver,
  CommercialRequester,
} from '../ports/advisor-scope-resolver.port.js';

/** One order by id; an advisor may only read their own (anti-IDOR). */
@Injectable()
export class GetOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Inject(COMMERCIAL_ADVISOR_SCOPE)
    private readonly advisorScope: AdvisorScopeResolver,
  ) {}

  async execute(id: number, requester: CommercialRequester): Promise<Order> {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    const ownAdvisorId = await this.advisorScope.execute(requester);
    if (ownAdvisorId !== null && order.advisorId !== ownAdvisorId) {
      throw new ForbiddenOperationException(
        'Advisors can only access their own orders',
      );
    }
    return order;
  }
}
