import type {
  IDashboardRepository,
  WeeklyKpisFilter,
  WeeklyKpisRaw,
} from '../ports/dashboard.repository.port.js';
import { GetWeeklyKpisUseCase } from './get-weekly-kpis.use-case.js';

const asesorUser = { id: 'u1', email: 'ana@x.com', role: 'ADVISOR' as const };
const directorUser = {
  id: 'u9',
  email: 'dir@x.com',
  role: 'DIRECTOR' as const,
};

const baseRaw: WeeklyKpisRaw = {
  visits: { scheduled: 12, completed: 9 },
  quotedValue: 215450000,
  orders: { closedOrders: 4, billing: 98300000 },
  weeklyTarget: 12,
};

function makeUseCase(
  raw: WeeklyKpisRaw,
  asesorId: number | null,
): { useCase: GetWeeklyKpisUseCase; captured: WeeklyKpisFilter[] } {
  const captured: WeeklyKpisFilter[] = [];
  const repo: IDashboardRepository = {
    async getWeeklyKpis(filter) {
      captured.push(filter);
      return raw;
    },
  };
  const scope = {
    async execute() {
      return asesorId;
    },
  };
  const useCase = new GetWeeklyKpisUseCase(scope, repo);
  return { useCase, captured };
}

describe('GetWeeklyKpisUseCase (HU-16 KPI comerciales de la semana)', () => {
  it('calcula efectividad, metas y montos a partir de los valores crudos', async () => {
    const { useCase } = makeUseCase(baseRaw, 7);

    const result = await useCase.execute(asesorUser, { week: '2026-W42' });

    expect(result.week).toBe('2026-W42');
    expect(result.scheduledVisits).toBe(12);
    expect(result.completedVisits).toBe(9);
    expect(result.effectivenessRate).toBe(75);
    expect(result.quotedValue).toBe(215450000);
    expect(result.closedOrders).toBe(4);
    expect(result.routeBilling).toBe(98300000);
    expect(result.weeklyGoal).toEqual({
      target: 12,
      completed: 9,
      percentage: 75,
    });
  });

  it('usa la semana ISO actual cuando no llega filtro de semana', async () => {
    const { useCase, captured } = makeUseCase(baseRaw, 7);

    const result = await useCase.execute(asesorUser, {});

    expect(result.week).toMatch(/^\d{4}-W(0[1-9]|[1-4]\d|5[0-3])$/);
    const [filter] = captured;
    const diffDays =
      (filter.weekEnd.getTime() - filter.weekStart.getTime()) /
      (24 * 60 * 60 * 1000);
    expect(diffDays).toBe(7);
  });

  it('resuelve los límites de una semana ISO conocida (2026-W01)', async () => {
    const { useCase, captured } = makeUseCase(baseRaw, 7);

    await useCase.execute(asesorUser, { week: '2026-W01' });

    const [filter] = captured;
    expect(filter.weekStart.toISOString().slice(0, 10)).toBe('2025-12-29');
    expect(filter.weekEnd.toISOString().slice(0, 10)).toBe('2026-01-05');
  });

  it('acepta el alias en español de la semana', async () => {
    const { useCase } = makeUseCase(baseRaw, 7);

    const result = await useCase.execute(asesorUser, { semana: '2026-W10' });

    expect(result.week).toBe('2026-W10');
  });

  it('devuelve efectividad 0 cuando no hay visitas programadas', async () => {
    const { useCase } = makeUseCase(
      { ...baseRaw, visits: { scheduled: 0, completed: 0 }, weeklyTarget: 0 },
      7,
    );

    const result = await useCase.execute(asesorUser, { week: '2026-W42' });

    expect(result.effectivenessRate).toBe(0);
    expect(result.weeklyGoal).toEqual({
      target: 0,
      completed: 0,
      percentage: 0,
    });
  });

  it('usa las visitas programadas como meta cuando la ruta no aporta meta', async () => {
    const { useCase } = makeUseCase(
      { ...baseRaw, visits: { scheduled: 12, completed: 3 }, weeklyTarget: 0 },
      7,
    );

    const result = await useCase.execute(asesorUser, { week: '2026-W42' });

    expect(result.weeklyGoal).toEqual({
      target: 12,
      completed: 3,
      percentage: 25,
    });
  });

  it('fuerza el alcance propio del asesor e ignora el filtro de zona', async () => {
    const { useCase, captured } = makeUseCase(baseRaw, 7);

    await useCase.execute(asesorUser, { week: '2026-W42', zone: 9 });

    const [filter] = captured;
    expect(filter.asesorId).toBe(7);
    expect(filter.zoneId).toBeNull();
  });

  it('ignora también el alias en español de zona para el asesor', async () => {
    const { useCase, captured } = makeUseCase(baseRaw, 7);

    await useCase.execute(asesorUser, { week: '2026-W42', zona: 9 });

    const [filter] = captured;
    expect(filter.asesorId).toBe(7);
    expect(filter.zoneId).toBeNull();
  });

  it('al director lo deja ver todos los datos cuando no filtra zona', async () => {
    const { useCase, captured } = makeUseCase(baseRaw, null);

    await useCase.execute(directorUser, { week: '2026-W42' });

    const [filter] = captured;
    expect(filter.asesorId).toBeNull();
    expect(filter.zoneId).toBeNull();
  });

  it('permite al director filtrar por zona con ambos nombres de filtro', async () => {
    const english = makeUseCase(baseRaw, null);
    await english.useCase.execute(directorUser, { week: '2026-W42', zone: 4 });
    expect(english.captured[0].zoneId).toBe(4);

    const spanish = makeUseCase(baseRaw, null);
    await spanish.useCase.execute(directorUser, { week: '2026-W42', zona: 5 });
    expect(spanish.captured[0].zoneId).toBe(5);
  });
});
