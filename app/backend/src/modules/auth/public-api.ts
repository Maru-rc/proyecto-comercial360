export { Auth, CurrentUser } from './presentation/auth.decorator.js';
export { AuthGuard } from './presentation/auth.guard.js';
export { RolesGuard } from './presentation/roles.guard.js';
export { Roles } from './presentation/roles.decorator.js';
export type {
  AuthenticatedUser,
  AuthenticatedUser as User,
} from './domain/authenticated-user.js';
export {
  USER_ROLES,
  USER_ROLES as UserRole,
  ROLES,
  type UserRole as UserRoleType,
  type Role,
  isUserRole,
  isRole,
} from '../../domain-contracts/index.js';
