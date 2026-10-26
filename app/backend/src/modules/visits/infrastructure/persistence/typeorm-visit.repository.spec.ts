import { describe, expect, it, vi } from 'vitest';
import type { Repository } from 'typeorm';
import { TypeOrmVisitRepository } from './typeorm-visit.repository.js';
import { VisitOutcomeOrmEntity } from './entities/visit-outcome.orm-entity.js';
import type { VisitOrmEntity } from './entities/visit.orm-entity.js';

const repositoryReturning = (row: VisitOutcomeOrmEntity | null) =>
  new TypeOrmVisitRepository(
    {} as Repository<VisitOrmEntity>,
    {
      findOne: vi.fn().mockResolvedValue(row),
    } as unknown as Repository<VisitOutcomeOrmEntity>,
  );

describe('TypeOrmVisitRepository.findOutcomeByVisit', () => {
  it('returns null for a stored result, which carries no outcome type', async () => {
    // A row read back from visit_results: the outcome type is not a column
    const stored = Object.assign(new VisitOutcomeOrmEntity(), {
      id: 7,
      visitId: 3,
      outcomeId: null,
      observations: 'Cliente interesado',
    });

    await expect(
      repositoryReturning(stored).findOutcomeByVisit(3),
    ).resolves.toBeNull();
  });

  it('returns null when the visit has no result', async () => {
    await expect(
      repositoryReturning(null).findOutcomeByVisit(3),
    ).resolves.toBeNull();
  });
});
