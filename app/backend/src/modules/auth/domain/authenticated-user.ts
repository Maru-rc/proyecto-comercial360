import { Role } from './role.js';

/** User coming from a valid Better Auth session. */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
