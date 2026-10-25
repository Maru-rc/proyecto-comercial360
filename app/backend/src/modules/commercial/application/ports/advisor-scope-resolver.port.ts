export interface CommercialRequester {
  id: string;
  email: string;
  role: string;
}

/**
 * Advisor the request may act on: an advisor always gets their own id (403
 * when asking for another); a director gets the requested id or null (all).
 */
export interface AdvisorScopeResolver {
  execute(
    user: CommercialRequester,
    requestedAdvisorId?: number,
  ): Promise<number | null>;
}

export const COMMERCIAL_ADVISOR_SCOPE = Symbol('COMMERCIAL_ADVISOR_SCOPE');
