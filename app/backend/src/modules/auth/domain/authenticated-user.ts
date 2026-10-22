import { Role } from './role.js';

/** Usuario que viene de una sesión válida de Better Auth. */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
