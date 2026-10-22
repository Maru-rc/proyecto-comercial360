import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { Quotation } from '../../domain/entities/quotation.entity.js';
import type { QuotationStatus } from '../../domain/entities/quotation.entity.js';
import { QUOTATION_REPOSITORY } from '../../domain/repositories/quotation-repository.port.js';
import type { IQuotationRepository } from '../../domain/repositories/quotation-repository.port.js';

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
}

@Injectable()
export class CreateQuotationUseCase {
  constructor(
    @Inject(QUOTATION_REPOSITORY)
    private readonly quotationRepository: IQuotationRepository,
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

    const quotation = Quotation.create({
      number,
      clientId: dto.clientId,
      advisorId: dto.advisorId,
      visitId: dto.visitId,
      amount: dto.amount,
      currency: dto.currency ?? 'COP',
      status: dto.status ?? 'DRAFT',
      date,
    });

    return this.quotationRepository.save(quotation);
  }
}
