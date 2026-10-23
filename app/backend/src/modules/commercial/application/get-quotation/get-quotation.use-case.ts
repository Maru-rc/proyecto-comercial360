import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { Quotation } from '../../domain/entities/quotation.entity.js';
import { QUOTATION_REPOSITORY } from '../../domain/repositories/quotation-repository.port.js';
import type { IQuotationRepository } from '../../domain/repositories/quotation-repository.port.js';

@Injectable()
export class GetQuotationUseCase {
  constructor(
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationRepository: IQuotationRepository,
  ) {}

  async execute(id: number): Promise<Quotation> {
    const quotation = await this.quotationRepository.findById(id);
    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }
    return quotation;
  }
}
