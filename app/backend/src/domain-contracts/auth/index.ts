export const USER_ROLES = {
  ADVISOR: 'ADVISOR',
  DIRECTOR: 'DIRECTOR',
} as const;

export const ROLES = [USER_ROLES.ADVISOR, USER_ROLES.DIRECTOR] as const;

export type UserRole = (typeof ROLES)[number];
export type Role = UserRole;

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === 'string' &&
    (value === USER_ROLES.ADVISOR || value === USER_ROLES.DIRECTOR)
  );
}

export function isRole(value: unknown): value is Role {
  return isUserRole(value);
}

export type {
  AuthenticatedUser,
  AuthenticatedUser as User,
} from '../../modules/auth/domain/authenticated-user.js';
export {
  Auth,
  CurrentUser,
} from '../../modules/auth/presentation/auth.decorator.js';
export {
  AuthGuard,
  type RequestWithUser,
} from '../../modules/auth/presentation/auth.guard.js';
export { RolesGuard } from '../../modules/auth/presentation/roles.guard.js';
