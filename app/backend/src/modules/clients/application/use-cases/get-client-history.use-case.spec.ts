import { describe, expect, it, vi } from 'vitest';
import { GetClientHistoryUseCase } from './get-client-history.use-case.js';
import { ClienteNoEncontradoError } from '../../domain/client.errors.js';
import type { ClientRepository } from '../ports/client.repository.port.js';

describe('GetClientHistoryUseCase (HU-15)', () => {
  const buildRepo = (overrides?: Partial<ClientRepository>): ClientRepository =>
    ({
      findByTaxId: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      saveWithRelations: vi.fn(),
      upsertWithRelations: vi.fn(),
      findHistoryByClientId: vi.fn(),
      ...overrides,
    }) as ClientRepository;

  it('retorna las últimas 3 interacciones del cliente por defecto', async () => {
    const mockHistory = [
      {
        id_historial: 3,
        id_cliente: 1,
        fecha: new Date('2026-10-24T10:00:00Z'),
        accion: 'Visita registrada',
        usuario: 'Juan Pérez',
        descripcion: 'Resultado: Interesado',
      },
      {
        id_historial: 2,
        id_cliente: 1,
        fecha: new Date('2026-10-20T09:00:00Z'),
        accion: 'Cotización creada',
        usuario: 'Juan Pérez',
        descripcion: 'COT-1241 | $ 12,600,000',
      },
      {
        id_historial: 1,
        id_cliente: 1,
        fecha: new Date('2026-10-15T08:00:00Z'),
        accion: 'Cliente creado',
        usuario: 'Director Comercial',
        descripcion: 'Creación manual desde formulario',
      },
    ];

    const findHistoryByClientId = vi.fn().mockResolvedValue(mockHistory);
    const repo = buildRepo({
      findById: vi.fn().mockResolvedValue({ id_cliente: 1 }),
      findHistoryByClientId,
    });

    const useCase = new GetClientHistoryUseCase(repo);
    const result = await useCase.execute(1);

    expect(findHistoryByClientId).toHaveBeenCalledWith(1, 3);
    expect(result).toHaveLength(3);
    expect(result[0].accion).toBe('Visita registrada');
  });

  it('lanza ClienteNoEncontradoError si el cliente no existe', async () => {
    const repo = buildRepo({
      findById: vi.fn().mockResolvedValue(null),
    });

    const useCase = new GetClientHistoryUseCase(repo);

    await expect(useCase.execute(999, 3)).rejects.toThrow(
      ClienteNoEncontradoError,
    );
  });
});
