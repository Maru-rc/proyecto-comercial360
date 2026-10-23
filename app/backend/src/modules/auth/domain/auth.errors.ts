import { ForbiddenOperationException } from '../../../domain-contracts/exceptions/forbidden-operation.exception.js';

export class UnlinkedAdvisorError extends ForbiddenOperationException {
  override readonly code = 'UNLINKED_ADVISOR';

  constructor(email: string) {
    super(`No advisor record is linked to email ${email}`);
    this.name = 'UnlinkedAdvisorError';
  }
}

export class AdvisorOutOfScopeError extends ForbiddenOperationException {
  override readonly code = 'ADVISOR_OUT_OF_SCOPE';

  constructor() {
    super('An advisor can only access their own information');
    this.name = 'AdvisorOutOfScopeError';
  }
}
