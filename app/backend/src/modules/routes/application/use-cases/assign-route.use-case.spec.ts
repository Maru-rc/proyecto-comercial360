import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AssignRouteUseCase } from './assign-route.use-case.js';
import type {
  RouteRecord,
  RouteRepository,
} from '../ports/route.repository.port.js';
import type { RouteVisitGeneratorPort } from '../ports/route-visit-generator.port.js';
import type { AdvisorReader } from '../../../../domain-contracts/advisors/advisor-reader.interface.js';
import {
  EntityNotFoundException,
  InvalidOperationException,
} from '../../../../domain-contracts/index.js';

describe('AssignRouteUseCase (TDD - HU-09)', () => {
  let useCase: AssignRouteUseCase;
  let mockRouteRepo: Partial<RouteRepository>;
  let mockAdvisorReader: Partial<AdvisorReader>;
  let mockVisitGenerator: Partial<RouteVisitGeneratorPort>;

  beforeEach(() => {
    mockRouteRepo = {
      findById: vi.fn(),
      getStops: vi.fn(),
      save: vi.fn(),
    };

    mockAdvisorReader = {
      existsById: vi.fn(),
    };

    mockVisitGenerator = {
      generateVisits: vi.fn(),
    };

    useCase = new AssignRouteUseCase(
      mockRouteRepo as RouteRepository,
      mockAdvisorReader as AdvisorReader,
      mockVisitGenerator as RouteVisitGeneratorPort,
    );
  });

  it('debe asignar exitosamente la ruta al asesor y generar sus visitas en estado PENDIENTE', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue({
      id: 1,
      name: 'Ruta Industrial',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: null,
      status: 'BORRADOR',
      startDate: new Date(2026, 10, 2),
      endDate: new Date(2026, 10, 9),
      salesRepresentativeId: null,
    });

    vi.mocked(mockRouteRepo.getStops!).mockResolvedValue([
      {
        id: 1,
        routeId: 1,
        customerId: 10,
        visitOrder: 1,
        suggestedTime: '09:00',
      },
      {
        id: 2,
        routeId: 1,
        customerId: 20,
        visitOrder: 2,
        suggestedTime: '11:00',
      },
    ]);

    vi.mocked(mockAdvisorReader.existsById!).mockResolvedValue(true);
    vi.mocked(mockRouteRepo.save!).mockImplementation(
      async (r) => r as RouteRecord,
    );
    vi.mocked(mockVisitGenerator.generateVisits!).mockResolvedValue(4);

    const result = await useCase.execute({
      routeId: 1,
      advisorId: 5,
      startDate: '2026-11-02',
      endDate: '2026-11-09',
    });

    expect(result.routeId).toBe(1);
    expect(result.advisorId).toBe(5);
    expect(result.status).toBe('ASIGNADA');
    expect(result.totalVisitsGenerated).toBe(4);

    expect(mockRouteRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 1,
        status: 'ASIGNADA',
        salesRepresentativeId: 5,
      }),
    );
    expect(mockVisitGenerator.generateVisits).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar EntityNotFoundException si la ruta no existe', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue(null);

    await expect(
      useCase.execute({ routeId: 999, advisorId: 5 }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('debe lanzar InvalidOperationException si la ruta no tiene paradas', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue({
      id: 1,
      name: 'Ruta Vacía',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: null,
      status: 'BORRADOR',
    });

    vi.mocked(mockAdvisorReader.existsById!).mockResolvedValue(true);
    vi.mocked(mockRouteRepo.getStops!).mockResolvedValue([]);

    await expect(useCase.execute({ routeId: 1, advisorId: 5 })).rejects.toThrow(
      InvalidOperationException,
    );
  });

  it('debe lanzar InvalidOperationException si el asesor no existe o no está activo', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue({
      id: 1,
      name: 'Ruta Industrial',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: null,
      status: 'BORRADOR',
    });

    vi.mocked(mockAdvisorReader.existsById!).mockResolvedValue(false);

    await expect(
      useCase.execute({ routeId: 1, advisorId: 999 }),
    ).rejects.toThrow(InvalidOperationException);
  });
});
