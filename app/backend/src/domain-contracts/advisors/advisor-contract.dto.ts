import type { UserRole } from '../auth/index.js';

export interface AdvisorContractDto {
  readonly id: number;
  readonly name: string;
  readonly email: string;
  readonly phone?: string | null;
  readonly role?: UserRole;
  readonly isActive: boolean;
}
