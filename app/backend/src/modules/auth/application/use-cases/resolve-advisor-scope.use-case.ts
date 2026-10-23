import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../domain/authenticated-user.js';
import {
  AdvisorOutOfScopeError,
  UnlinkedAdvisorError,
} from '../../domain/auth.errors.js';
import { USER_ROLES } from '../../domain/role.js';
import { ADVISOR_REPOSITORY } from '../ports/advisor.repository.js';
import type { AdvisorRepository } from '../ports/advisor.repository.js';

/**
 * Anti-IDOR rule for commercial modules (visits, agenda, KPIs).
 *
 * - ADVISOR: the id is ALWAYS resolved from the database using their email.
 *   If the client sends a different advisor id, the request is rejected (403).
 * - DIRECTOR: can query any advisor; if none is requested, returns null
 *   (no filter — all advisors).
 */
@Injectable()
export class ResolveAdvisorScopeUseCase {
  constructor(
    @Inject(ADVISOR_REPOSITORY) private readonly advisors: AdvisorRepository,
  ) {}

  async execute(
    user: AuthenticatedUser,
    requestedAdvisorId?: number,
  ): Promise<number | null> {
    if (user.role === USER_ROLES.DIRECTOR) {
      return requestedAdvisorId ?? null;
    }

    const own = await this.advisors.findByEmail(user.email);
    if (!own) {
      throw new UnlinkedAdvisorError(user.email);
    }

    if (
      requestedAdvisorId !== undefined &&
      requestedAdvisorId !== own.idAdvisor
    ) {
      throw new AdvisorOutOfScopeError();
    }
    return own.idAdvisor;
  }
}
