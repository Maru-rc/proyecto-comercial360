import { Inject, Injectable } from '@nestjs/common';
import { AuthenticatedUser } from '../../domain/authenticated-user.js';
import { UnlinkedAdvisorError } from '../../domain/auth.errors.js';
import { Role, USER_ROLES } from '../../domain/role.js';
import { ADVISOR_REPOSITORY } from '../ports/advisor.repository.js';
import type { AdvisorRepository } from '../ports/advisor.repository.js';

export interface MeResult {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: Role;
  readonly advisor: {
    readonly idAdvisor: number;
    readonly phone: string | null;
    readonly status: string;
  } | null;
}

@Injectable()
export class GetMeUseCase {
  constructor(
    @Inject(ADVISOR_REPOSITORY) private readonly advisors: AdvisorRepository,
  ) {}

  async execute(user: AuthenticatedUser): Promise<MeResult> {
    const base = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    if (user.role === USER_ROLES.DIRECTOR) {
      return { ...base, advisor: null };
    }

    const advisor = await this.advisors.findByEmail(user.email);
    if (!advisor) {
      throw new UnlinkedAdvisorError(user.email);
    }

    return {
      ...base,
      advisor: {
        idAdvisor: advisor.idAdvisor,
        phone: advisor.phone,
        status: advisor.status,
      },
    };
  }
}
