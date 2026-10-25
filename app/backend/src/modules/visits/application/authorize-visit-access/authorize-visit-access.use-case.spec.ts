import { NotFoundException } from '@nestjs/common';
import { ForbiddenOperationException } from '../../../../domain-contracts/index.js';
import { Visit } from '../../domain/entities/visit.entity.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';
import type { AdvisorScopeResolver } from '../ports/advisor-scope-resolver.port.js';
import { AuthorizeVisitAccessUseCase } from './authorize-visit-access.use-case.js';

// Visit 1 belongs to advisor 10; visit 2 belongs to advisor 20.
const visits = [
  Visit.create({
    id: 1,
    clientId: 5,
    advisorId: 10,
    scheduledDate: new Date('2026-10-22'),
  }),
  Visit.create({
    id: 2,
    clientId: 6,
    advisorId: 20,
    scheduledDate: new Date('2026-10-22'),
  }),
];
const repository = {
  findById: async (id: number) => visits.find((v) => v.id === id) ?? null,
} as unknown as IVisitRepository;

// Simulates ResolveAdvisorScopeUseCase: an advisor is limited to their own id;
// a director (null) has no filter.
const scopeOf = (advisorId: number | null): AdvisorScopeResolver => ({
  execute: async () => advisorId,
});
const user = { id: 'u1', email: 'x@x.com', role: 'ADVISOR' };

describe('AuthorizeVisitAccessUseCase (HU-10: an advisor only accesses their own visits)', () => {
  it('lets an advisor access their own visit', async () => {
    const useCase = new AuthorizeVisitAccessUseCase(repository, scopeOf(10));
    const visit = await useCase.execute(user, 1);
    expect(visit.advisorId).toBe(10);
  });

  it('rejects an advisor accessing another advisor visit (403)', async () => {
    const useCase = new AuthorizeVisitAccessUseCase(repository, scopeOf(10));
    await expect(useCase.execute(user, 2)).rejects.toBeInstanceOf(
      ForbiddenOperationException,
    );
  });

  it('lets a director access any advisor visit', async () => {
    const useCase = new AuthorizeVisitAccessUseCase(repository, scopeOf(null));
    expect((await useCase.execute(user, 1)).advisorId).toBe(10);
    expect((await useCase.execute(user, 2)).advisorId).toBe(20);
  });

  it('answers 404 for a visit that does not exist', async () => {
    const useCase = new AuthorizeVisitAccessUseCase(repository, scopeOf(null));
    await expect(useCase.execute(user, 99)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('does not return the visit when the advisor has no linked record', async () => {
    const unlinked: AdvisorScopeResolver = {
      execute: async () => {
        throw new ForbiddenOperationException('unlinked');
      },
    };
    const useCase = new AuthorizeVisitAccessUseCase(repository, unlinked);
    await expect(useCase.execute(user, 1)).rejects.toBeInstanceOf(
      ForbiddenOperationException,
    );
  });
});
