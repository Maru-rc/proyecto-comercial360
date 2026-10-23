import type { Quotation } from '../entities/quotation.entity.js';

export interface IQuotationRepository {
  save(quotation: Quotation): Promise<Quotation>;
  findById(id: number): Promise<Quotation | null>;
  findByNumber(number: string): Promise<Quotation | null>;
  findByClient(clientId: number): Promise<Quotation[]>;
  findByVisit(visitId: number): Promise<Quotation[]>;
  findAll(): Promise<Quotation[]>;
}

export const QUOTATION_REPOSITORY = Symbol('QUOTATION_REPOSITORY');
