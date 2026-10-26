import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLES, type Role } from '../domain/role.js';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from './roles.guard.js';

// Example controller to inspect @Roles metadata
class SampleController {
  @Roles(USER_ROLES.DIRECTOR)
  directorOnly() {}
  openEndpoint() {}
}

function createMockContext(
  method: 'directorOnly' | 'openEndpoint',
  role?: Role,
) {
  return {
    getHandler: () => SampleController.prototype[method],
    getClass: () => SampleController,
    switchToHttp: () => ({
      getRequest: () => ({
        authUser: role ? { id: '1', name: 'n', email: 'e', role } : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());

  it('advisor receives 403 on director-only operation', () => {
    expect(() =>
      guard.canActivate(createMockContext('directorOnly', USER_ROLES.ADVISOR)),
    ).toThrow(ForbiddenException);
  });

  it('director is allowed on director-only operation', () => {
    expect(
      guard.canActivate(createMockContext('directorOnly', USER_ROLES.DIRECTOR)),
    ).toBe(true);
  });

  it('without @Roles decorator, any authenticated user is allowed', () => {
    expect(
      guard.canActivate(createMockContext('openEndpoint', USER_ROLES.ADVISOR)),
    ).toBe(true);
  });

  it('without authenticated user throws UnauthorizedException (401)', () => {
    expect(() => guard.canActivate(createMockContext('directorOnly'))).toThrow(
      UnauthorizedException,
    );
  });
});
