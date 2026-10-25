import {
  ConflictException,
  Inject,
  Injectable,
  Optional,
} from '@nestjs/common';
import { Quotation } from '../../domain/entities/quotation.entity.js';
import type { QuotationStatus } from '../../domain/entities/quotation.entity.js';
import { QUOTATION_REPOSITORY } from '../../domain/repositories/quotation-repository.port.js';
import type { IQuotationRepository } from '../../domain/repositories/quotation-repository.port.js';
import { COMMERCIAL_ADVISOR_SCOPE } from '../ports/advisor-scope-resolver.port.js';
import { resolveOwnerAdvisor } from '../resolve-owner-advisor.js';
import type {
  AdvisorScopeResolver,
  CommercialRequester,
} from '../ports/advisor-scope-resolver.port.js';

export interface CreateQuotationInputDto {
  number?: string;
  quotationNumber?: string;
  clientId: number;
  advisorId?: number | null;
  visitId?: number | null;
  amount: number;
  currency?: string;
  status?: QuotationStatus;
  date?: Date | string;
  /** When present, the advisor is resolved from the session (anti-IDOR). */
  requester?: CommercialRequester;
}

@Injectable()
export class CreateQuotationUseCase {
  constructor(
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationRepository: IQuotationRepository,
    @Optional()
    @Inject(COMMERCIAL_ADVISOR_SCOPE)
    private readonly advisorScope?: AdvisorScopeResolver,
  ) {}

  async execute(dto: CreateQuotationInputDto): Promise<Quotation> {
    const rawNumber = dto.number ?? dto.quotationNumber ?? '';
    const number = rawNumber.trim();
    if (!number) {
      throw new Error('Quotation number is required');
    }

    const existing = await this.quotationRepository.findByNumber(number);
    if (existing) {
      throw new ConflictException(
        `Quotation with number ${number} already exists`,
      );
    }

    const date = dto.date
      ? typeof dto.date === 'string'
        ? new Date(dto.date)
        : dto.date
      : new Date();

    const advisorId = await resolveOwnerAdvisor(this.advisorScope, dto);
    const quotation = Quotation.create({
      number,
      clientId: dto.clientId,
      advisorId,
      visitId: dto.visitId,
      amount: dto.amount,
      currency: dto.currency ?? 'COP',
      status: dto.status ?? 'DRAFT',
      date,
    });

    return this.quotationRepository.save(quotation);
  }
}
