import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SetRouteStopsUseCase } from './set-route-stops.use-case.js';
import { RouteRepository } from '../ports/route.repository.port.js';
import { ClientReader } from '../../../../domain-contracts/clients/client-reader.interface.js';
import {
  EntityNotFoundException,
  ResourceConflictException,
  DomainException,
} from '../../../../domain-contracts/index.js';

describe('SetRouteStopsUseCase (TDD - HU-08)', () => {
  let useCase: SetRouteStopsUseCase;
  let mockRouteRepo: Partial<RouteRepository>;
  let mockClientReader: Partial<ClientReader>;

  beforeEach(() => {
    mockRouteRepo = {
      findById: vi.fn(),
      setStops: vi.fn(),
      getStops: vi.fn(),
    };

    mockClientReader = {
      existsById: vi.fn(),
    };

    useCase = new SetRouteStopsUseCase(
      mockRouteRepo as RouteRepository,
      mockClientReader as ClientReader,
    );
  });

  it('debe asignar y ordenar correctamente las paradas para una ruta existente', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue({
      id: 1,
      name: 'Ruta Norte',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: 'Ruta de prueba',
      status: 'BORRADOR',
    });

    vi.mocked(mockClientReader.existsById!).mockResolvedValue(true);

    vi.mocked(mockRouteRepo.setStops!).mockImplementation(
      async (routeId, stops) => {
        return stops.map((s, idx) => ({
          id: idx + 1,
          routeId,
          customerId: s.customerId,
          visitOrder: s.visitOrder,
          suggestedTime: s.suggestedTime ?? null,
        }));
      },
    );

    const result = await useCase.execute(1, [
      { customerId: 10, visitOrder: 2, suggestedTime: '10:00' },
      { customerId: 20, visitOrder: 1, suggestedTime: '08:30' },
    ]);

    expect(result).toHaveLength(2);
    // Deben haberse reordenado por visitOrder o secuencia: 20 primero (orden 1), 10 después (orden 2)
    expect(result[0].customerId).toBe(20);
    expect(result[0].visitOrder).toBe(1);
    expect(result[1].customerId).toBe(10);
    expect(result[1].visitOrder).toBe(2);
    expect(mockRouteRepo.setStops).toHaveBeenCalledTimes(1);
  });

  it('debe lanzar EntityNotFoundException si la ruta no existe', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue(null);

    await expect(useCase.execute(999, [{ customerId: 10 }])).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('debe lanzar ResourceConflictException si hay clientes duplicados en la lista', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue({
      id: 1,
      name: 'Ruta Norte',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: null,
      status: 'BORRADOR',
    });

    await expect(
      useCase.execute(1, [
        { customerId: 10, visitOrder: 1 },
        { customerId: 10, visitOrder: 2 },
      ]),
    ).rejects.toThrow(ResourceConflictException);
  });

  it('debe lanzar EntityNotFoundException si un cliente no existe', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue({
      id: 1,
      name: 'Ruta Norte',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: null,
      status: 'BORRADOR',
    });

    vi.mocked(mockClientReader.existsById!).mockImplementation(
      async (id) => id === 10,
    );

    await expect(
      useCase.execute(1, [
        { customerId: 10, visitOrder: 1 },
        { customerId: 99, visitOrder: 2 },
      ]),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('debe permitir vaciar la ruta enviando una lista vacía de paradas', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue({
      id: 1,
      name: 'Ruta Norte',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: null,
      status: 'BORRADOR',
    });

    vi.mocked(mockRouteRepo.setStops!).mockResolvedValue([]);

    const result = await useCase.execute(1, []);
    expect(result).toHaveLength(0);
    expect(mockRouteRepo.setStops).toHaveBeenCalledWith(1, []);
  });

  it('debe lanzar DomainException si la hora sugerida tiene un formato inválido', async () => {
    vi.mocked(mockRouteRepo.findById!).mockResolvedValue({
      id: 1,
      name: 'Ruta Norte',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: null,
      status: 'BORRADOR',
    });

    vi.mocked(mockClientReader.existsById!).mockResolvedValue(true);

    await expect(
      useCase.execute(1, [{ customerId: 10, suggestedTime: '25:99' }]),
    ).rejects.toThrow(DomainException);
  });
});
