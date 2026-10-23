import { DomainException } from './domain.exception.js';

export class ForbiddenOperationException extends DomainException {
  readonly code = 'FORBIDDEN_OPERATION';

  constructor(
    message: string = 'Operation not permitted.',
    details: unknown = null,
  ) {
    super(message, details);
  }
}
