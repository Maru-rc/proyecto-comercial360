import { SetMetadata } from '@nestjs/common';
import { Role } from '../domain/role.js';

export const ROLES_KEY = 'roles';

/** Indica qué roles pueden llamar al endpoint: @Roles('DIRECTOR') */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
