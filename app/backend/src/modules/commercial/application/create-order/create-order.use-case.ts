import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { Order } from '../../domain/entities/order.entity.js';
import type { OrderStatus } from '../../domain/entities/order.entity.js';
import { ORDER_REPOSITORY } from '../../domain/repositories/order-repository.port.js';
import type { IOrderRepository } from '../../domain/repositories/order-repository.port.js';
import { QUOTATION_REPOSITORY } from '../../domain/repositories/quotation-repository.port.js';
import type { IQuotationRepository } from '../../domain/repositories/quotation-repository.port.js';
import { resolveOwnerAdvisor } from '../resolve-owner-advisor.js';
import { COMMERCIAL_ADVISOR_SCOPE } from '../ports/advisor-scope-resolver.port.js';
import type {
  AdvisorScopeResolver,
  CommercialRequester,
} from '../ports/advisor-scope-resolver.port.js';

export interface CreateOrderInputDto {
  number?: string;
  orderNumber?: string;
  clientId: number;
  advisorId?: number | null;
  visitId?: number | null;
  quotationId?: number | null;
  amount: number;
  status?: OrderStatus;
  date?: Date | string;
  estimatedDeliveryDate?: Date | string | null;
  /** When present, the advisor is resolved from the session (anti-IDOR). */
  requester?: CommercialRequester;
}

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(ORDER_REPOSITORY)
    private readonly orderRepository: IOrderRepository,
    @Optional()
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationRepository?: IQuotationRepository,
    @Optional()
    @Inject(COMMERCIAL_ADVISOR_SCOPE)
    private readonly advisorScope?: AdvisorScopeResolver,
  ) {}

  async execute(dto: CreateOrderInputDto): Promise<Order> {
    const rawNumber = dto.number ?? dto.orderNumber ?? '';
    const number = rawNumber.trim();
    if (!number) {
      throw new Error('Order number is required');
    }

    const existing = await this.orderRepository.findByNumber(number);
    if (existing) {
      throw new ConflictException(`Order with number ${number} already exists`);
    }

    if (dto.quotationId && this.quotationRepository) {
      const quotation = await this.quotationRepository.findById(
        dto.quotationId,
      );
      if (!quotation) {
        throw new BadRequestException(
          `Quotation with ID ${dto.quotationId} does not exist`,
        );
      }
    }

    const date = dto.date
      ? typeof dto.date === 'string'
        ? new Date(dto.date)
        : dto.date
      : new Date();

    const estimatedDeliveryDate = dto.estimatedDeliveryDate
      ? typeof dto.estimatedDeliveryDate === 'string'
        ? new Date(dto.estimatedDeliveryDate)
        : dto.estimatedDeliveryDate
      : null;

    const advisorId = await resolveOwnerAdvisor(this.advisorScope, dto);
    const order = Order.create({
      number,
      clientId: dto.clientId,
      advisorId,
      visitId: dto.visitId,
      quotationId: dto.quotationId,
      amount: dto.amount,
      status: dto.status ?? 'PENDING',
      date,
      estimatedDeliveryDate,
    });

    return this.orderRepository.save(order);
  }
}
