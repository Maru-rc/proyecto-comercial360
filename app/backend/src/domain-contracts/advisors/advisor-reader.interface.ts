import type { AdvisorContractDto } from './advisor-contract.dto.js';

export interface AdvisorReader {
  existsById(id: number): Promise<boolean>;
  getSummaryById(id: number): Promise<AdvisorContractDto | null>;
  listActive(): Promise<AdvisorContractDto[]>;
}
