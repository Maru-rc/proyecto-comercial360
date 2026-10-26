import type { FollowUpContractDto } from './follow-up-contract.dto.js';

export interface FollowUpReader {
  getPendingByClient(clientId: number): Promise<FollowUpContractDto[]>;
}
