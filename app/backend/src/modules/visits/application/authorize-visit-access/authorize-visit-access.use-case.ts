import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ForbiddenOperationException } from '../../../../domain-contracts/index.js';
import type { Visit } from '../../domain/entities/visit.entity.js';
import { VISIT_REPOSITORY } from '../../domain/repositories/visit-repository.port.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';
import { ADVISOR_SCOPE_RESOLVER } from '../ports/advisor-scope-resolver.port.js';
import type {
  AdvisorScopeResolver,
  VisitRequestUser,
} from '../ports/advisor-scope-resolver.port.js';

/**
 * Anti-IDOR rule for a single visit (HU-10).
 *
 * Loads the visit and checks that the user may read or change it:
 * - Advisor: only if the visit is theirs (otherwise 403).
 * - Director: any visit.
 * If the visit does not exist, it answers 404.
 */
@Injectable()
export class AuthorizeVisitAccessUseCase {
  constructor(
    @Inject(VISIT_REPOSITORY)
    private readonly visitRepository: IVisitRepository,
    @Inject(ADVISOR_SCOPE_RESOLVER)
    private readonly advisorScope: AdvisorScopeResolver,
  ) {}

  async execute(user: VisitRequestUser, visitId: number): Promise<Visit> {
    const visit = await this.visitRepository.findById(visitId);
    if (!visit) {
      throw new NotFoundException(`Visit with ID ${visitId} not found`);
    }

    // Advisor: their real id. Director without a filter: null (may see all).
    const ownAdvisorId = await this.advisorScope.execute(user);
    if (ownAdvisorId !== null && ownAdvisorId !== visit.advisorId) {
      throw new ForbiddenOperationException(
        'Advisors can only access their own visits',
      );
    }
    return visit;
  }
}
