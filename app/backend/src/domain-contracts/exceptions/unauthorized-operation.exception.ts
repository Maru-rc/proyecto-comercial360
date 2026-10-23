import { DomainException } from './domain.exception.js';

export class UnauthorizedOperationException extends DomainException {
  readonly code = 'UNAUTHORIZED_OPERATION';

  constructor(
    message: string = 'Authentication credentials required.',
    details: unknown = null,
  ) {
    super(message, details);
  }
}
