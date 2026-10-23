import type {
  ClientContractDto,
  ClientCoordinatesContractDto,
  ClientSummaryContractDto,
} from './client-contract.dto.js';

export interface ClientReader {
  existsById(id: number): Promise<boolean>;
  getSummaryById(id: number): Promise<ClientSummaryContractDto | null>;
  getCoordinatesById(id: number): Promise<ClientCoordinatesContractDto | null>;
  getById?(id: number): Promise<ClientContractDto | null>;
}
