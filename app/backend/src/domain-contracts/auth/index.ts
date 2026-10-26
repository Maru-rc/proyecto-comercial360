// Roles live in their own file so the auth module can use them without
// loading its presentation layer back through this barrel (ESM cycle).
export * from './roles.js';

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
