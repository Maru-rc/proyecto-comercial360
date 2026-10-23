import { describe, expect, it } from 'vitest';
import {
  DomainException,
  EntityNotFoundException,
  ForbiddenOperationException,
  InvalidOperationException,
  ResourceConflictException,
  UnauthorizedOperationException,
} from './index.js';

describe('Domain Exceptions Hierarchy (Clean Architecture)', () => {
  it('EntityNotFoundException should carry entity name, identifier, and ENTITY_NOT_FOUND code', () => {
    const errorWithId = new EntityNotFoundException('Client', 'CLI-001');
    expect(errorWithId).toBeInstanceOf(DomainException);
    expect(errorWithId).toBeInstanceOf(Error);
    expect(errorWithId.code).toBe('ENTITY_NOT_FOUND');
    expect(errorWithId.name).toBe('EntityNotFoundException');
    expect(errorWithId.message).toBe(
      'Client with identifier "CLI-001" was not found.',
    );

    const errorWithoutId = new EntityNotFoundException('Visit');
    expect(errorWithoutId.message).toBe('Visit was not found.');
  });

  it('InvalidOperationException should format message and optional details', () => {
    const error = new InvalidOperationException('Visit already completed', {
      visitId: 10,
    });
    expect(error).toBeInstanceOf(DomainException);
    expect(error.code).toBe('INVALID_OPERATION');
    expect(error.details).toEqual({ visitId: 10 });
  });

  it('ResourceConflictException should carry RESOURCE_CONFLICT code', () => {
    const error = new ResourceConflictException('Email already registered');
    expect(error).toBeInstanceOf(DomainException);
    expect(error.code).toBe('RESOURCE_CONFLICT');
  });

  it('ForbiddenOperationException should carry FORBIDDEN_OPERATION code', () => {
    const error = new ForbiddenOperationException();
    expect(error).toBeInstanceOf(DomainException);
    expect(error.code).toBe('FORBIDDEN_OPERATION');
    expect(error.message).toBe('Operation not permitted.');
  });

  it('UnauthorizedOperationException should carry UNAUTHORIZED_OPERATION code', () => {
    const error = new UnauthorizedOperationException();
    expect(error).toBeInstanceOf(DomainException);
    expect(error.code).toBe('UNAUTHORIZED_OPERATION');
    expect(error.message).toBe('Authentication credentials required.');
  });
});
