import type { ClientSummaryRecord } from './client.repository.port.js';

export interface ClientReader {
  findById(id: number): Promise<ClientSummaryRecord | null>;
  findByTaxId(taxId: string): Promise<ClientSummaryRecord | null>;
  findAll(filter?: {
    search?: string;
    tipo?: string;
    zona?: string;
  }): Promise<ClientSummaryRecord[]>;
}

export const CLIENT_READER = Symbol('CLIENT_READER');
