export interface VisitRequestUser {
  id: string;
  email: string;
  role: string;
}

export interface AdvisorScopeResolver {
  execute(
    user: VisitRequestUser,
    requestedAdvisorId?: number,
  ): Promise<number | null>;
}

export const ADVISOR_SCOPE_RESOLVER = Symbol('ADVISOR_SCOPE_RESOLVER');
