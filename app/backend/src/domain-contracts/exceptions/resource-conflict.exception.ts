import { DomainException } from './domain.exception.js';

export class ResourceConflictException extends DomainException {
  readonly code: string = 'RESOURCE_CONFLICT';

  constructor(message: string, details: unknown = null) {
    super(message, details);
  }
}
