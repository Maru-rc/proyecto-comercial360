import type {
  IVisitTrackingRepository,
  VisitTrackingFilter,
  VisitTrackingPage,
  VisitTrackingRow,
} from '../ports/visit-tracking.port.js';
import { GetVisitTrackingUseCase } from './get-visit-tracking.use-case.js';

const advisorUser = {
  id: 'u1',
  email: 'ana@x.com',
  role: 'ADVISOR' as const,
};
const directorUser = {
  id: 'u9',
  email: 'dir@x.com',
  role: 'DIRECTOR' as const,
};

const baseRow: VisitTrackingRow = {
  visitId: 42,
  date: '2026-10-21',
  advisorName: 'Juan Perez',
  territory: 'NORTE',
  week: 43,
  day: 'Tuesday',
  route: 'RUT-002',
  customer: 'Metalurgicas S.A.S',
  municipality: 'Barranquilla',
  customerType: 'Industrial',
  potential: 'Alto',
  visitStatus: 'VISITADO',
  outcome: 'Interesado',
  quoteNumber: 'COT-1242',
  quoteAmount: 24800000,
  orderNumber: null,
  nextFollowUpDate: '2026-10-28',
};

function makeUseCase(
  page: VisitTrackingPage,
  advisorId: number | null,
): {
  useCase: GetVisitTrackingUseCase;
  captured: VisitTrackingFilter[];
} {
  const captured: VisitTrackingFilter[] = [];
  const repo: IVisitTrackingRepository = {
    async findPage(filter) {
      captured.push(filter);
      return page;
    },
  };
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

  it('normalizes the Spanish period display values to canonical periods', async () => {
    const todayCase = makeUseCase({ rows: [], total: 0 }, 7);
    await todayCase.useCase.execute(advisorUser, { periodo: 'Hoy' });
    expect(todayCase.captured[0].period).toBe('today');

    const monthCase = makeUseCase({ rows: [], total: 0 }, 7);
    await monthCase.useCase.execute(advisorUser, { periodo: 'Este mes' });
    expect(monthCase.captured[0].period).toBe('month');

    const weekCase = makeUseCase({ rows: [], total: 0 }, 7);
    await weekCase.useCase.execute(advisorUser, { periodo: 'Esta semana' });
    expect(weekCase.captured[0].period).toBe('week');
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
