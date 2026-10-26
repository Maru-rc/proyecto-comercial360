export interface RouteRequester {
  id: string;
  email: string;
  role: string;
}

/** An advisor always resolves to their own id; a director to null (all). */
export interface AdvisorScopeResolver {
  execute(user: RouteRequester): Promise<number | null>;
}

export const ROUTES_ADVISOR_SCOPE = Symbol('ROUTES_ADVISOR_SCOPE');
