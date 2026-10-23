import { describe, expect, it } from 'vitest';
import { UnlinkedAdvisorError } from '../../domain/auth.errors.js';
import { USER_ROLES } from '../../domain/role.js';
import {
  AdvisorRecord,
  AdvisorRepository,
} from '../ports/advisor.repository.js';
import { GetMeUseCase } from './get-me.use-case.js';

class InMemoryAdvisors implements AdvisorRepository {
  constructor(private readonly items: AdvisorRecord[]) {}
  async findByEmail(email: string) {
    return (
      this.items.find((a) => a.email.toLowerCase() === email.toLowerCase()) ??
      null
    );
  }
}

const juan: AdvisorRecord = {
  idAdvisor: 7,
  name: 'Juan',
  email: 'juan.perez@x.com',
  phone: '300',
  status: 'ACTIVE',
};

describe('GetMeUseCase', () => {
  const useCase = new GetMeUseCase(new InMemoryAdvisors([juan]));

  it('returns the linked advisor by email and the ADVISOR role', async () => {
    const me = await useCase.execute({
      id: 'u1',
      name: 'Juan',
      email: 'juan.perez@x.com',
      role: USER_ROLES.ADVISOR,
    });
    expect(me).toEqual({
      id: 'u1',
      name: 'Juan',
      email: 'juan.perez@x.com',
      role: USER_ROLES.ADVISOR,
      advisor: { idAdvisor: 7, phone: '300', status: 'ACTIVE' },
    });
  });

  it('director does not return an advisor even if one exists with their email', async () => {
    const me = await useCase.execute({
      id: 'u2',
      name: 'Dir',
      email: 'juan.perez@x.com',
      role: USER_ROLES.DIRECTOR,
    });
    expect(me.role).toBe(USER_ROLES.DIRECTOR);
    expect(me.advisor).toBeNull();
  });

  it('an advisor without a record in sales_representatives throws UnlinkedAdvisorError', async () => {
    await expect(
      useCase.execute({
        id: 'u3',
        name: 'X',
        email: 'otro@x.com',
        role: USER_ROLES.ADVISOR,
      }),
    ).rejects.toBeInstanceOf(UnlinkedAdvisorError);
  });
});
