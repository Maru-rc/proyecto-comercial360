import { describe, expect, it, vi } from 'vitest';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { DomainExceptionFilter } from './domain-exception.filter.js';
import {
  EntityNotFoundException,
  ForbiddenOperationException,
  InvalidOperationException,
  ResourceConflictException,
  UnauthorizedOperationException,
} from '../../../domain-contracts/index.js';

describe('DomainExceptionFilter', () => {
  const createMockArgumentsHost = (requestUrl: string = '/api/visits/10') => {
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    const mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    const mockRequest = {
      url: requestUrl,
    };

    const mockHost: ArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse as any,
        getRequest: () => mockRequest as any,
        getNext: vi.fn(),
      }),
      getArgs: vi.fn(),
      getArgByIndex: vi.fn(),
      switchToRpc: vi.fn(),
      switchToWs: vi.fn(),
      getType: vi.fn(),
    };

    return { mockHost, statusMock, jsonMock };
  };

  it('should map EntityNotFoundException to HTTP 404', () => {
    const filter = new DomainExceptionFilter();
    const { mockHost, statusMock, jsonMock } =
      createMockArgumentsHost('/api/clients/99');
    const exception = new EntityNotFoundException('Client', 99);

    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        error: 'EntityNotFoundException',
        code: 'ENTITY_NOT_FOUND',
        message: 'Client with identifier "99" was not found.',
        path: '/api/clients/99',
      }),
    );
  });

  it('should map ResourceConflictException to HTTP 409', () => {
    const filter = new DomainExceptionFilter();
    const { mockHost, statusMock, jsonMock } = createMockArgumentsHost();
    const exception = new ResourceConflictException('Email duplicate');

    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        error: 'ResourceConflictException',
        code: 'RESOURCE_CONFLICT',
      }),
    );
  });

  it('should map ForbiddenOperationException to HTTP 403', () => {
    const filter = new DomainExceptionFilter();
    const { mockHost, statusMock, jsonMock } = createMockArgumentsHost();
    const exception = new ForbiddenOperationException();

    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        error: 'ForbiddenOperationException',
        code: 'FORBIDDEN_OPERATION',
      }),
    );
  });

  it('should map UnauthorizedOperationException to HTTP 401', () => {
    const filter = new DomainExceptionFilter();
    const { mockHost, statusMock, jsonMock } = createMockArgumentsHost();
    const exception = new UnauthorizedOperationException();

    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        code: 'UNAUTHORIZED_OPERATION',
      }),
    );
  });

  it('should map InvalidOperationException to HTTP 400 with details', () => {
    const filter = new DomainExceptionFilter();
    const { mockHost, statusMock, jsonMock } = createMockArgumentsHost();
    const exception = new InvalidOperationException('State invalid', {
      currentStatus: 'CANCELLED',
    });

    filter.catch(exception, mockHost);

    expect(statusMock).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        error: 'InvalidOperationException',
        code: 'INVALID_OPERATION',
        message: 'State invalid',
        details: { currentStatus: 'CANCELLED' },
      }),
    );
  });
});
