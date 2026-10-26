import type {
  AdvisorScopeResolver,
  CommercialRequester,
} from './ports/advisor-scope-resolver.port.js';

/** The advisor that owns a new document: from the session when known. */
export async function resolveOwnerAdvisor(
  advisorScope: AdvisorScopeResolver | undefined,
  dto: { advisorId?: number | null; requester?: CommercialRequester },
): Promise<number | null | undefined> {
  if (!advisorScope || !dto.requester) {
    return dto.advisorId;
  }
  const scoped = await advisorScope.execute(
    dto.requester,
    dto.advisorId ?? undefined,
  );
  return scoped ?? dto.advisorId;
}
