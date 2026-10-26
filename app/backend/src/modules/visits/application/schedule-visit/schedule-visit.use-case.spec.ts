import { describe, it, expect } from 'vitest';
import { ScheduleVisitUseCase } from './schedule-visit.use-case.js';
import type { Visit } from '../../domain/entities/visit.entity.js';
import type { IVisitRepository } from '../../domain/repositories/visit-repository.port.js';

const capturingRepo = () => {
  const saved: Visit[] = [];
  const repo = {
    save: async (visit: Visit) => {
      saved.push(visit);
      return visit;
    },
  } as unknown as IVisitRepository;
  return { repo, saved };
};

describe('ScheduleVisitUseCase', () => {
  it('stores the start time inside the scheduled timestamp', async () => {
    const { repo, saved } = capturingRepo();
    await new ScheduleVisitUseCase(repo).execute({
      clientId: 1,
      advisorId: 2,
      scheduledDate: '2026-10-25',
      startTime: '09:30',
    });
    const date = saved[0].scheduledDate;
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 9, 25,
    ]);
    expect([date.getHours(), date.getMinutes()]).toEqual([9, 30]);
  });

  it('keeps a date-only visit and ignores a malformed time', async () => {
    const { repo, saved } = capturingRepo();
    const useCase = new ScheduleVisitUseCase(repo);
    await useCase.execute({
      clientId: 1,
      advisorId: 2,
      scheduledDate: '2026-10-25',
    });
    await useCase.execute({
      clientId: 1,
      advisorId: 2,
      scheduledDate: '2026-10-25',
      startTime: '25:99',
    });
    expect(saved[0].scheduledDate.toISOString()).toBe(
      '2026-10-25T00:00:00.000Z',
    );
    expect(saved[1].scheduledDate.toISOString()).toBe(
      '2026-10-25T00:00:00.000Z',
    );
  });

  it('applies the time to a Date input too', async () => {
    const { repo, saved } = capturingRepo();
    await new ScheduleVisitUseCase(repo).execute({
      clientId: 1,
      advisorId: 2,
      scheduledDate: new Date(2026, 9, 25),
      startTime: '14:05',
    });
    expect(saved[0].scheduledDate.getHours()).toBe(14);
    expect(saved[0].scheduledDate.getMinutes()).toBe(5);
  });
});
