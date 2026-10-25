import type { Quotation } from '../entities/quotation.entity.js';
import type {
  CommercialPage,
  CommercialPageFilter,
} from './commercial-page.js';

export interface IQuotationRepository {
  save(quotation: Quotation): Promise<Quotation>;
  findById(id: number): Promise<Quotation | null>;
  findByNumber(number: string): Promise<Quotation | null>;
  findByClient(clientId: number): Promise<Quotation[]>;
  findByVisit(visitId: number): Promise<Quotation[]>;
  findAll(): Promise<Quotation[]>;
  findPage(filter: CommercialPageFilter): Promise<CommercialPage<Quotation>>;
}

export const QUOTATION_REPOSITORY = Symbol('QUOTATION_REPOSITORY');
