import type {
  IVisitTrackingRepository,
  VisitTrackingFilter,
  VisitTrackingRow,
} from '../ports/visit-tracking.port.js';
import { ExportVisitTrackingCsvUseCase } from './export-visit-tracking-csv.use-case.js';

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
  rows: VisitTrackingRow[],
  advisorId: number | null,
): {
  useCase: ExportVisitTrackingCsvUseCase;
  captured: VisitTrackingFilter[];
} {
  const captured: VisitTrackingFilter[] = [];
  const repo: IVisitTrackingRepository = {
    async findPage(filter) {
      return { rows: [], total: 0 };
    },
    async findAll(filter) {
      captured.push(filter);
      return rows;
    },
  };
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
