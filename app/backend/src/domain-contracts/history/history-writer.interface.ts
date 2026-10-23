import type {
  CreateHistoryEntryContractDto,
  HistoryEntryContractDto,
} from './history-contract.dto.js';

export interface HistoryWriter {
  recordEvent(
    entry: CreateHistoryEntryContractDto,
    unitOfWork?: unknown,
  ): Promise<void>;
  getRecentByClient?(
    clientId: number,
    limit?: number,
  ): Promise<HistoryEntryContractDto[]>;
}
