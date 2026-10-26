import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ForbiddenOperationException } from '../../../../domain-contracts/index.js';
import type { Quotation } from '../../domain/entities/quotation.entity.js';
import { QUOTATION_REPOSITORY } from '../../domain/repositories/quotation-repository.port.js';
import type { IQuotationRepository } from '../../domain/repositories/quotation-repository.port.js';
import { COMMERCIAL_ADVISOR_SCOPE } from '../ports/advisor-scope-resolver.port.js';
import type {
  AdvisorScopeResolver,
  CommercialRequester,
} from '../ports/advisor-scope-resolver.port.js';

/** One quotation by id; an advisor may only read their own (anti-IDOR). */
@Injectable()
export class GetQuotationUseCase {
  constructor(
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationRepository: IQuotationRepository,
    @Inject(COMMERCIAL_ADVISOR_SCOPE)
    private readonly advisorScope: AdvisorScopeResolver,
  ) {}

  async execute(
    id: number,
    requester: CommercialRequester,
  ): Promise<Quotation> {
    const quotation = await this.quotationRepository.findById(id);
    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }
    const ownAdvisorId = await this.advisorScope.execute(requester);
    if (ownAdvisorId !== null && quotation.advisorId !== ownAdvisorId) {
      throw new ForbiddenOperationException(
        'Advisors can only access their own quotations',
      );
    }
    return quotation;
  }
}
