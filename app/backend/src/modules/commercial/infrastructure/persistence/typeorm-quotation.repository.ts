import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type {
  QuotationContractDto,
  QuotationReader,
} from '../../../../domain-contracts/index.js';
import type { Quotation } from '../../domain/entities/quotation.entity.js';
import type { IQuotationRepository } from '../../domain/repositories/quotation-repository.port.js';
import type {
  CommercialPage,
  CommercialPageFilter,
} from '../../domain/repositories/commercial-page.js';
import { QuotationOrmEntity } from './entities/quotation.orm-entity.js';
import { QuotationMapper } from './mappers/quotation.mapper.js';

@Injectable()
export class TypeOrmQuotationRepository
  implements IQuotationRepository, QuotationReader
{
  constructor(
    @InjectRepository(QuotationOrmEntity)
    private readonly repository: Repository<QuotationOrmEntity>,
  ) {}

  async save(quotation: Quotation): Promise<Quotation> {
    const orm = QuotationMapper.toOrm(quotation);
    const saved = await this.repository.save(orm);
    return QuotationMapper.toDomain(saved);
  }

  async findById(id: number): Promise<Quotation | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? QuotationMapper.toDomain(entity) : null;
  }

  async findByNumber(number: string): Promise<Quotation | null> {
    const entity = await this.repository.findOne({ where: { number } });
    return entity ? QuotationMapper.toDomain(entity) : null;
  }

  async findByClient(clientId: number): Promise<Quotation[]> {
    const list = await this.repository.find({
      where: { clientId },
      order: { date: 'DESC' },
    });
    return list.map((item) => QuotationMapper.toDomain(item));
  }

  async findByVisit(visitId: number): Promise<Quotation[]> {
    const list = await this.repository.find({
      where: { visitId },
      order: { date: 'DESC' },
    });
    return list.map((item) => QuotationMapper.toDomain(item));
  }

  async findPage(
    filter: CommercialPageFilter,
  ): Promise<CommercialPage<Quotation>> {
    const [list, total] = await this.repository.findAndCount({
      where: filter.advisorId === null ? {} : { advisorId: filter.advisorId },
      order: { date: 'DESC', id: 'DESC' },
      skip: (filter.page - 1) * filter.limit,
      take: filter.limit,
    });
    return { items: list.map((item) => QuotationMapper.toDomain(item)), total };
  }

  async findAll(): Promise<Quotation[]> {
    const list = await this.repository.find({
      order: { date: 'DESC' },
    });
    return list.map((item) => QuotationMapper.toDomain(item));
  }

  async getQuotationById(id: number): Promise<QuotationContractDto | null> {
    const quotation = await this.findById(id);
    return quotation ? QuotationMapper.toContract(quotation) : null;
  }
}
