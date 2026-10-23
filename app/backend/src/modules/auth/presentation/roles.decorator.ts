import { SetMetadata } from '@nestjs/common';
import { Role } from '../domain/role.js';

export const ROLES_KEY = 'roles';

/** Restricts an endpoint to specific roles: @Roles('DIRECTOR') */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
