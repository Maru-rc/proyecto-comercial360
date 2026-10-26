import { Role } from './role.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
