import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  CLIENT_READER,
  createPaginatedResult,
} from '../../../../domain-contracts/index.js';
import type {
  ClientReader,
  PaginatedResult,
} from '../../../../domain-contracts/index.js';
import type { Order } from '../../domain/entities/order.entity.js';
import { ORDER_REPOSITORY } from '../../domain/repositories/order-repository.port.js';
import type { IOrderRepository } from '../../domain/repositories/order-repository.port.js';
import { COMMERCIAL_ADVISOR_SCOPE } from '../ports/advisor-scope-resolver.port.js';
import type {
  AdvisorScopeResolver,
  CommercialRequester,
} from '../ports/advisor-scope-resolver.port.js';

export interface OrderListItem {
  order: Order;
  clientName: string | null;
}

export interface ListOrdersInputDto {
  requester: CommercialRequester;
  advisorId?: number;
  page: number;
  limit: number;
}

/** Orders the requester may see: an advisor only theirs, a director all. */
@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly repository: IOrderRepository,
    @Inject(COMMERCIAL_ADVISOR_SCOPE)
    private readonly advisorScope: AdvisorScopeResolver,
    @Optional()
    @Inject(CLIENT_READER)
    private readonly clientReader?: ClientReader,
  ) {}

  async execute(
    dto: ListOrdersInputDto,
  ): Promise<PaginatedResult<OrderListItem>> {
    const advisorId = await this.advisorScope.execute(
      dto.requester,
      dto.advisorId,
    );
    const { items, total } = await this.repository.findPage({
      advisorId,
      page: dto.page,
      limit: dto.limit,
    });
    const withNames = await Promise.all(
      items.map(async (order) => ({
        order,
        clientName: await this.clientName(order.clientId),
      })),
    );
    return createPaginatedResult(withNames, total, dto.page, dto.limit);
  }

  private async clientName(clientId: number): Promise<string | null> {
    if (!this.clientReader) {
      return null;
    }
    const client = await this.clientReader.getSummaryById(clientId);
    return client ? (client.commercialName ?? client.legalName) : null;
  }
}
