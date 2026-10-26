import { DomainException } from './domain.exception.js';

export class EntityNotFoundException extends DomainException {
  readonly code: string = 'ENTITY_NOT_FOUND';

  constructor(entityName: string, identifier?: string | number) {
    const descriptiveMessage =
      identifier !== undefined
        ? `${entityName} with identifier "${identifier}" was not found.`
        : `${entityName} was not found.`;
    super(descriptiveMessage);
  }
}
