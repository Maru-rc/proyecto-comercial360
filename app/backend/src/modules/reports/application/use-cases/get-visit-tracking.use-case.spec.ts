import { GetVisitTrackingUseCase } from './get-visit-tracking.use-case.js';
import {
  advisorUser,
  baseRow,
  directorUser,
  makeTrackingRepo,
  type VisitTrackingFilter,
} from './visit-tracking-test.helpers.js';
import type { VisitTrackingRow } from '../ports/visit-tracking.port.js';

function makeUseCase(
  page: { rows: VisitTrackingRow[]; total: number },
  advisorId: number | null,
): {
  useCase: GetVisitTrackingUseCase;
  captured: VisitTrackingFilter[];
} {
  const { repo, captured } = makeTrackingRepo(page);
  const scope = {
    async execute() {
      return advisorId;
    },
  };
  const useCase = new GetVisitTrackingUseCase(scope, repo);
  return { useCase, captured };
}

describe('GetVisitTrackingUseCase (HU-17 seguimiento de visitas)', () => {
  it('returns the paginated rows with computed metadata', async () => {
    const { useCase } = makeUseCase({ rows: [baseRow], total: 24 }, 7);

    const result = await useCase.execute(advisorUser, {
      page: 2,
      limit: 5,
    });

    expect(result.data).toEqual([baseRow]);
    expect(result.meta).toEqual({
      total: 24,
      page: 2,
      limit: 5,
      totalPages: 5,
      hasNextPage: true,
      hasPreviousPage: true,
    });
  });

  it('defaults to the current week and first page of ten rows', async () => {
    const { useCase, captured } = makeUseCase({ rows: [baseRow], total: 1 }, 7);

    await useCase.execute(advisorUser, {});

    const [filter] = captured;
    expect(filter.period).toBe('week');
    expect(filter.page).toBe(1);
    expect(filter.limit).toBe(10);
  });

  it('normalizes period values to canonical English periods', async () => {
    const todayCase = makeUseCase({ rows: [], total: 0 }, 7);
    await todayCase.useCase.execute(advisorUser, { periodo: 'today' });
    expect(todayCase.captured[0].period).toBe('today');

    const monthCase = makeUseCase({ rows: [], total: 0 }, 7);
    await monthCase.useCase.execute(advisorUser, { periodo: 'month' });
    expect(monthCase.captured[0].period).toBe('month');

    const weekCase = makeUseCase({ rows: [], total: 0 }, 7);
    await weekCase.useCase.execute(advisorUser, { periodo: 'week' });
    expect(weekCase.captured[0].period).toBe('week');

    const todayEsCase = makeUseCase({ rows: [], total: 0 }, 7);
    await todayEsCase.useCase.execute(advisorUser, { periodo: 'Hoy' });
    expect(todayEsCase.captured[0].period).toBe('today');

    const monthEsCase = makeUseCase({ rows: [], total: 0 }, 7);
    await monthEsCase.useCase.execute(advisorUser, { periodo: 'Este mes' });
    expect(monthEsCase.captured[0].period).toBe('month');

    const weekEsCase = makeUseCase({ rows: [], total: 0 }, 7);
    await weekEsCase.useCase.execute(advisorUser, { periodo: 'Esta semana' });
    expect(weekEsCase.captured[0].period).toBe('week');
  });

  it('forwards every filter to the repository', async () => {
    const { useCase, captured } = makeUseCase({ rows: [], total: 0 }, null);

    await useCase.execute(directorUser, {
      periodo: 'mes',
      estado: 'VISITADO',
      ruta: 3,
      tipo_cliente: 'Industrial',
      potencial: 'Alto',
      asesor: 5,
      page: 3,
      limit: 20,
    });

    const [filter] = captured;
    expect(filter).toEqual({
      period: 'month',
      status: 'VISITADO',
      routeId: 3,
      customerType: 'Industrial',
      potential: 'Alto',
      advisorId: null,
      page: 3,
      limit: 20,
    });
  });

  it('keeps the advisor scope own id even when another advisor is requested', async () => {
    const { useCase, captured } = makeUseCase({ rows: [], total: 0 }, 7);

    await useCase.execute(advisorUser, { asesor: 99 });

    expect(captured[0].advisorId).toBe(7);
  });

  it('lets the director view every advisor when no filter is provided', async () => {
    const { useCase, captured } = makeUseCase({ rows: [], total: 0 }, null);

    await useCase.execute(directorUser, {});

    expect(captured[0].advisorId).toBeNull();
  });

  it('returns an empty page with valid metadata when there are no rows', async () => {
    const { useCase } = makeUseCase({ rows: [], total: 0 }, 7);

    const result = await useCase.execute(advisorUser, { page: 1, limit: 5 });

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
    expect(result.meta.totalPages).toBe(1);
    expect(result.meta.hasNextPage).toBe(false);
  });
});
