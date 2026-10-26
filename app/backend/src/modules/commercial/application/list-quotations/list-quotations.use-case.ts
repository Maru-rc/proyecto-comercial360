import { Inject, Injectable, Optional } from '@nestjs/common';
import {
  CLIENT_READER,
  createPaginatedResult,
} from '../../../../domain-contracts/index.js';
import type {
  ClientReader,
  PaginatedResult,
} from '../../../../domain-contracts/index.js';
import type { Quotation } from '../../domain/entities/quotation.entity.js';
import { QUOTATION_REPOSITORY } from '../../domain/repositories/quotation-repository.port.js';
import type { IQuotationRepository } from '../../domain/repositories/quotation-repository.port.js';
import { COMMERCIAL_ADVISOR_SCOPE } from '../ports/advisor-scope-resolver.port.js';
import type {
  AdvisorScopeResolver,
  CommercialRequester,
} from '../ports/advisor-scope-resolver.port.js';

export interface QuotationListItem {
  quotation: Quotation;
  clientName: string | null;
}

export interface ListQuotationsInputDto {
  requester: CommercialRequester;
  advisorId?: number;
  page: number;
  limit: number;
}

/** Quotations the requester may see: an advisor only theirs, a director all. */
@Injectable()
export class ListQuotationsUseCase {
  constructor(
    @Inject(QUOTATION_REPOSITORY)
    private readonly repository: IQuotationRepository,
    @Inject(COMMERCIAL_ADVISOR_SCOPE)
    private readonly advisorScope: AdvisorScopeResolver,
    @Optional()
    @Inject(CLIENT_READER)
    private readonly clientReader?: ClientReader,
  ) {}

  async execute(
    dto: ListQuotationsInputDto,
  ): Promise<PaginatedResult<QuotationListItem>> {
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
      items.map(async (quotation) => ({
        quotation,
        clientName: await this.clientName(quotation.clientId),
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
