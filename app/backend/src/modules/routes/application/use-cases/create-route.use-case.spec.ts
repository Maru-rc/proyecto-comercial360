import { describe, it, expect, beforeEach } from 'vitest';
import {
  CreateRouteUseCase,
  type CreateRouteCommand,
} from './create-route.use-case.js';
import type {
  RouteRepository,
  RouteRecord,
} from '../ports/route.repository.port.js';
import { InvalidOperationException } from '../../../../domain-contracts/index.js';

class InMemoryRouteRepository implements RouteRepository {
  public routes: RouteRecord[] = [];

  async save(route: Partial<RouteRecord>): Promise<RouteRecord> {
    const id = this.routes.length + 1;
    const newRecord: RouteRecord = {
      id,
      name: route.name!,
      zoneId: route.zoneId ?? null,
      zoneName: route.zoneName ?? null,
      executionDay: route.executionDay ?? null,
      frequency: route.frequency ?? null,
      startTime: route.startTime ?? null,
      endTime: route.endTime ?? null,
      description: route.description ?? null,
      status: route.status ?? 'BORRADOR',
      startDate: route.startDate ?? null,
      endDate: route.endDate ?? null,
      salesRepresentativeId: route.salesRepresentativeId ?? null,
    };
    this.routes.push(newRecord);
    return newRecord;
  }

  async findById(id: number): Promise<RouteRecord | null> {
    return this.routes.find((r) => r.id === id) ?? null;
  }

  async existsByName(name: string): Promise<boolean> {
    return this.routes.some(
      (r) => r.name.toLowerCase() === name.trim().toLowerCase(),
    );
  }
}

describe('CreateRouteUseCase (TDD - HU-07)', () => {
  let repository: InMemoryRouteRepository;
  let useCase: CreateRouteUseCase;

  beforeEach(() => {
    repository = new InMemoryRouteRepository();
    useCase = new CreateRouteUseCase(repository);
  });

  it('debe crear una ruta con estado inicial BORRADOR y todos sus datos generales', async () => {
    const command: CreateRouteCommand = {
      name: 'Ruta Industrial Norte 1',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startTime: '08:00',
      endTime: '17:00',
      description: 'Ruta para sector ferretero e industrial',
    };

    const result = await useCase.execute(command);

    expect(result.id).toBeDefined();
    expect(result.name).toBe('Ruta Industrial Norte 1');
    expect(result.zoneId).toBe(1);
    expect(result.executionDay).toBe('Lunes');
    expect(result.frequency).toBe('Semanal');
    expect(result.startTime).toBe('08:00');
    expect(result.endTime).toBe('17:00');
    expect(result.description).toBe('Ruta para sector ferretero e industrial');
    expect(result.status).toBe('BORRADOR'); // Invariante de negocio obligatorio
    expect(repository.routes.length).toBe(1);
  });

  it('debe forzar estado BORRADOR incluso si el comando intenta pasar otro estado', async () => {
    const command: CreateRouteCommand = {
      name: 'Ruta Sur',
      zoneId: 2,
      executionDay: 'Martes',
      frequency: 'Quincenal',
      // @ts-expect-error probando entrada inválida
      status: 'ASIGNADA',
    };

    const result = await useCase.execute(command);

    expect(result.status).toBe('BORRADOR');
  });

  it('debe lanzar InvalidOperationException si el nombre está vacío', async () => {
    const command: CreateRouteCommand = {
      name: '   ',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Semanal',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidOperationException,
    );
    await expect(useCase.execute(command)).rejects.toThrow(
      'El nombre de la ruta es obligatorio',
    );
  });

  it('debe lanzar InvalidOperationException si la zona geográfica no es proporcionada', async () => {
    const command: CreateRouteCommand = {
      name: 'Ruta Sin Zona',
      // @ts-expect-error probando zona faltante
      zoneId: null,
      executionDay: 'Miércoles',
      frequency: 'Semanal',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidOperationException,
    );
    await expect(useCase.execute(command)).rejects.toThrow(
      'La zona geográfica es obligatoria',
    );
  });

  it('debe lanzar InvalidOperationException si el día de ejecución no es válido', async () => {
    const command: CreateRouteCommand = {
      name: 'Ruta Día Inválido',
      zoneId: 1,
      executionDay: 'DiaInexistente',
      frequency: 'Semanal',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidOperationException,
    );
    await expect(useCase.execute(command)).rejects.toThrow(
      'Día de ejecución no válido',
    );
  });

  it('debe lanzar InvalidOperationException si la frecuencia no es válida', async () => {
    const command: CreateRouteCommand = {
      name: 'Ruta Frecuencia Inválida',
      zoneId: 1,
      executionDay: 'Lunes',
      frequency: 'Anual',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidOperationException,
    );
    await expect(useCase.execute(command)).rejects.toThrow(
      'Frecuencia no válida',
    );
  });

  it('debe rechazar horarios donde la hora de fin sea anterior o igual a la de inicio', async () => {
    const command: CreateRouteCommand = {
      name: 'Ruta Horario Inválido',
      zoneId: 1,
      executionDay: 'Jueves',
      frequency: 'Semanal',
      startTime: '16:00',
      endTime: '09:00',
    };

    await expect(useCase.execute(command)).rejects.toThrow(
      InvalidOperationException,
    );
    await expect(useCase.execute(command)).rejects.toThrow(
      'La hora de fin debe ser posterior a la de inicio',
    );
  });
});
