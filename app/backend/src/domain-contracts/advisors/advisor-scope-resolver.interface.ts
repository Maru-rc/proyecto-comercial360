import type { Role } from '../auth/index.js';

export interface ScopeUserContract {
  id: string;
  email: string;
  role: Role;
}

export interface AdvisorScopeResolver {
  execute(
    user: ScopeUserContract,
    requestedAdvisorId?: number,
  ): Promise<number | null>;
}

export const ADVISOR_SCOPE_RESOLVER = Symbol('ADVISOR_SCOPE_RESOLVER');
