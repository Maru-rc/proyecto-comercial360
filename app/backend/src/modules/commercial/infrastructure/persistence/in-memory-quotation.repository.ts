import type {
  QuotationContractDto,
  QuotationReader,
} from '../../../../domain-contracts/index.js';
import { Quotation } from '../../domain/entities/quotation.entity.js';
import type { IQuotationRepository } from '../../domain/repositories/quotation-repository.port.js';
import type {
  CommercialPage,
  CommercialPageFilter,
} from '../../domain/repositories/commercial-page.js';
import { QuotationMapper } from './mappers/quotation.mapper.js';

export class InMemoryQuotationRepository
  implements IQuotationRepository, QuotationReader
{
  private readonly quotations: Quotation[] = [];
  private autoIncrementId = 1;

  async save(quotation: Quotation): Promise<Quotation> {
    const existingIndex = quotation.id
      ? this.quotations.findIndex((q) => q.id === quotation.id)
      : -1;

    const id = quotation.id ?? this.autoIncrementId++;
    const saved = Quotation.create({
      id,
      number: quotation.number,
      clientId: quotation.clientId,
      advisorId: quotation.advisorId,
      visitId: quotation.visitId,
      amount: quotation.amount,
      currency: quotation.currency,
      status: quotation.status,
      date: quotation.date,
      createdAt: quotation.createdAt,
    });

    if (existingIndex >= 0) {
      this.quotations[existingIndex] = saved;
    } else {
      this.quotations.push(saved);
    }

    return saved;
  }

  async findById(id: number): Promise<Quotation | null> {
    return this.quotations.find((q) => q.id === id) ?? null;
  }

  async findByNumber(number: string): Promise<Quotation | null> {
    return this.quotations.find((q) => q.number === number) ?? null;
  }

  async findByClient(clientId: number): Promise<Quotation[]> {
    return this.quotations.filter((q) => q.clientId === clientId);
  }

  async findByVisit(visitId: number): Promise<Quotation[]> {
    return this.quotations.filter((q) => q.visitId === visitId);
  }

  async findPage(
    filter: CommercialPageFilter,
  ): Promise<CommercialPage<Quotation>> {
    const matching = this.quotations
      .filter(
        (item) =>
          filter.advisorId === null || item.advisorId === filter.advisorId,
      )
      .sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
    const start = (filter.page - 1) * filter.limit;
    return {
      items: matching.slice(start, start + filter.limit),
      total: matching.length,
    };
  }

  async findAll(): Promise<Quotation[]> {
    return [...this.quotations];
  }

  async getQuotationById(id: number): Promise<QuotationContractDto | null> {
    const q = await this.findById(id);
    return q ? QuotationMapper.toContract(q) : null;
  }

  clear(): void {
    this.quotations.length = 0;
    this.autoIncrementId = 1;
  }
}
