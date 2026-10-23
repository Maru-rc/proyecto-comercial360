import { describe, expect, it } from 'vitest';
import {
  AdvisorOutOfScopeError,
  UnlinkedAdvisorError,
} from '../../domain/auth.errors.js';
import { USER_ROLES } from '../../domain/role.js';
import {
  AdvisorRecord,
  AdvisorRepository,
} from '../ports/advisor.repository.js';
import { ResolveAdvisorScopeUseCase } from './resolve-advisor-scope.use-case.js';

class InMemoryAdvisors implements AdvisorRepository {
  constructor(private readonly items: AdvisorRecord[]) {}
  async findByEmail(email: string) {
    return this.items.find((a) => a.email === email) ?? null;
  }
}

const advisors: AdvisorRecord[] = [
  {
    idAdvisor: 1,
    name: 'Ana',
    email: 'ana@x.com',
    phone: '1',
    status: 'ACTIVE',
  },
  {
    idAdvisor: 2,
    name: 'Beto',
    email: 'beto@x.com',
    phone: '2',
    status: 'ACTIVE',
  },
];

const ana = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@x.com',
  role: USER_ROLES.ADVISOR,
};

const director = {
  id: 'u9',
  name: 'Dir',
  email: 'dir@x.com',
  role: USER_ROLES.DIRECTOR,
};

describe('ResolveAdvisorScopeUseCase (Anti-IDOR rule)', () => {
  const useCase = new ResolveAdvisorScopeUseCase(
    new InMemoryAdvisors(advisors),
  );

  it('the advisor is always scoped to their own id', async () => {
    expect(await useCase.execute(ana)).toBe(1);
    expect(await useCase.execute(ana, 1)).toBe(1);
  });

  it('rejects an advisor requesting data of another advisor', async () => {
    await expect(useCase.execute(ana, 2)).rejects.toBeInstanceOf(
      AdvisorOutOfScopeError,
    );
  });

  it('director can query any advisor or all', async () => {
    expect(await useCase.execute(director, 2)).toBe(2);
    expect(await useCase.execute(director)).toBeNull();
  });

  it('an advisor without record has no scope', async () => {
    await expect(
      useCase.execute({
        id: 'u5',
        name: 'Z',
        email: 'z@x.com',
        role: USER_ROLES.ADVISOR,
      }),
    ).rejects.toBeInstanceOf(UnlinkedAdvisorError);
  });
});
