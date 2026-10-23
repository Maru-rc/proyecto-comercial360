import { ExportVisitTrackingCsvUseCase } from './export-visit-tracking-csv.use-case.js';
import {
  advisorUser,
  baseRow,
  directorUser,
  makeTrackingRepo,
  type VisitTrackingFilter,
} from './visit-tracking-test.helpers.js';

function makeUseCase(
  rows: any[],
  advisorId: number | null,
): {
  useCase: ExportVisitTrackingCsvUseCase;
  captured: VisitTrackingFilter[];
} {
  const { repo, captured } = makeTrackingRepo({ rows, total: rows.length });
  const scope = {
    async execute() {
      return advisorId;
    },
  };
  const useCase = new ExportVisitTrackingCsvUseCase(scope, repo);
  return { useCase, captured };
}

describe('ExportVisitTrackingCsvUseCase (HU-18)', () => {
  it('returns all filtered rows and forces page to 1 with large limit', async () => {
    const { useCase, captured } = makeUseCase([baseRow], 7);

    const result = await useCase.execute(advisorUser, { page: 5, limit: 10 });

    expect(result).toEqual([baseRow]);
    expect(captured[0].page).toBe(1);
    expect(captured[0].limit).toBe(1000000);
    expect(captured[0].advisorId).toBe(7);
  });

  it('normalizes period aliases to canonical English values', async () => {
    const { useCase, captured } = makeUseCase([], 7);

    await useCase.execute(advisorUser, { periodo: 'Hoy' });
    expect(captured[0].period).toBe('today');

    await useCase.execute(advisorUser, { periodo: 'Esta semana' });
    expect(captured[1].period).toBe('week');

    await useCase.execute(advisorUser, { periodo: 'Este mes' });
    expect(captured[2].period).toBe('month');
  });

  it('forwards all filters and respects director scope', async () => {
    const { useCase, captured } = makeUseCase([], null);

    await useCase.execute(directorUser, {
      periodo: 'month',
      estado: 'PENDIENTE',
      ruta: 2,
      tipo_cliente: 'Comercial',
      potencial: 'Medio',
      asesor: 5,
    });

    expect(captured[0]).toEqual({
      period: 'month',
      status: 'PENDIENTE',
      routeId: 2,
      customerType: 'Comercial',
      potential: 'Medio',
      advisorId: null,
      page: 1,
      limit: 1000000,
    });
  });
});
