import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetRouteByIdUseCase } from './get-route-by-id.use-case.js';
import type { RouteRepository } from '../ports/route.repository.port.js';
import { EntityNotFoundException } from '../../../../domain-contracts/index.js';

describe('GetRouteByIdUseCase', () => {
  let useCase: GetRouteByIdUseCase;
  let mockRouteRepo: Partial<RouteRepository>;

  beforeEach(() => {
    mockRouteRepo = {
      findById: vi.fn(),
      getStops: vi.fn(),
    };
    useCase = new GetRouteByIdUseCase(mockRouteRepo as RouteRepository);
  });

  it('debe retornar la ruta y sus paradas si existe', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue({
      id: 1,
      name: 'Ruta Norte',
      zoneId: 2,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: 'Prueba',
      status: 'BORRADOR',
    });

    vi.mocked(mockRouteRepo.getStops!).mockResolvedValue([
      {
        id: 1,
        routeId: 1,
        customerId: 10,
        visitOrder: 1,
        suggestedTime: '09:00',
      },
    ]);

    const result = await useCase.execute(1);
    expect(result.id).toBe(1);
    expect(result.name).toBe('Ruta Norte');
    expect(result.paradas).toHaveLength(1);
    expect(result.paradas[0].customerId).toBe(10);
  });

  it('debe lanzar EntityNotFoundException si la ruta no existe', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
  });
});
