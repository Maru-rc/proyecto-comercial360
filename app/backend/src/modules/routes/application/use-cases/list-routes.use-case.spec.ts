import { describe, expect, it, vi } from 'vitest';
import { ListRoutesUseCase } from './list-routes.use-case.js';
import type {
  RouteRecord,
  RouteRepository,
} from '../ports/route.repository.port.js';

describe('ListRoutesUseCase (HU-07)', () => {
  it('retorna todas las rutas registradas', async () => {
    const mockRoutes: RouteRecord[] = [
      {
        id: 1,
        name: 'Ruta Industrial Norte',
        zoneId: 1,
        executionDay: 'Martes',
        frequency: 'Semanal',
        startTime: '08:00',
        endTime: '17:00',
        description: 'Ruta industrial',
        status: 'ASIGNADA',
      },
    ];

    const findAll = vi.fn().mockResolvedValue(mockRoutes);
    const routeRepo: RouteRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll,
      existsByName: vi.fn(),
      setStops: vi.fn(),
      getStops: vi.fn(),
    };

    const useCase = new ListRoutesUseCase(routeRepo);
    const result = await useCase.execute();

    expect(findAll).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockRoutes);
  });

  it('an advisor only gets the routes assigned to them; a director all', async () => {
    const findAll = vi.fn().mockResolvedValue([]);
    const routeRepo: RouteRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll,
      existsByName: vi.fn(),
      setStops: vi.fn(),
      getStops: vi.fn(),
    };
    const scope = {
      execute: async (user: { role: string }) =>
        user.role === 'DIRECTOR' ? null : 7,
    };
    const useCase = new ListRoutesUseCase(routeRepo, scope);

    await useCase.execute({ id: 'a', email: 'a@x', role: 'ADVISOR' });
    expect(findAll).toHaveBeenLastCalledWith({ advisorId: 7 });

    await useCase.execute({ id: 'd', email: 'd@x', role: 'DIRECTOR' });
    expect(findAll).toHaveBeenLastCalledWith({});
  });
});
