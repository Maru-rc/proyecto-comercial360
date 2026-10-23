import { DomainException } from './domain.exception.js';

export class InvalidOperationException extends DomainException {
  readonly code = 'INVALID_OPERATION';

  constructor(message: string, details: unknown = null) {
    super(message, details);
  }
}
