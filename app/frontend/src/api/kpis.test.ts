import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('./client', () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient } from './client';
import { getAgendaDelDia, resumirSeguimiento, SIN_DOCUMENTO } from './kpis';
import type { ISeguimientoFila } from '../types/kpi';

const get = vi.mocked(apiClient.get);

const fila = (overrides: Partial<ISeguimientoFila>): ISeguimientoFila =>
  ({
    id: '1',
    estado_visita: 'Pendiente',
    cotizacion: SIN_DOCUMENTO,
    valor_cotizacion: 0,
    pedido: SIN_DOCUMENTO,
    ...overrides,
  }) as ISeguimientoFila;

describe('resumirSeguimiento (bitácora de visitas)', () => {
  it('counts each quote and order once, even when repeated on several rows', () => {
    const resumen = resumirSeguimiento([
      fila({
        id: '1',
        estado_visita: 'Visitado',
        cotizacion: 'COT-1',
        valor_cotizacion: 1000,
        pedido: 'PED-1',
      }),
      // Same customer on another visit: the backend repeats the latest documents
      fila({
        id: '2',
        estado_visita: 'Pendiente',
        cotizacion: 'COT-1',
        valor_cotizacion: 1000,
        pedido: 'PED-1',
      }),
      fila({
        id: '3',
        estado_visita: 'Visitado',
        cotizacion: 'COT-2',
        valor_cotizacion: 500,
      }),
      fila({ id: '4', estado_visita: 'Sin visitar' }),
    ]);

    expect(resumen).toEqual({
      visitas: 4,
      visitadas: 2,
      efectividad: 50,
      cotizaciones: 2,
      valorCotizado: 1500,
      pedidos: 1,
    });
  });

  it('returns zeros for an empty week instead of dividing by zero', () => {
    expect(resumirSeguimiento([])).toEqual({
      visitas: 0,
      visitadas: 0,
      efectividad: 0,
      cotizaciones: 0,
      valorCotizado: 0,
      pedidos: 0,
    });
  });
});

describe('getAgendaDelDia', () => {
  afterEach(() => vi.clearAllMocks());

  it('numbers the stops by their position, not by the order the API sends (always 1)', async () => {
    get.mockResolvedValue({
      data: [
        {
          id: 10,
          clientId: 1,
          order: 1,
          suggestedTime: '09:00',
          visitStatus: 'PENDIENTE',
        },
        {
          id: 11,
          clientId: 2,
          order: 1,
          suggestedTime: '10:00',
          visitStatus: 'COMPLETED',
        },
        {
          id: 12,
          clientId: 3,
          order: 1,
          suggestedTime: '11:00',
          visitStatus: 'PENDIENTE',
        },
      ],
    });

    const agenda = await getAgendaDelDia('2026-10-26');

    expect(agenda.map((a) => [a.id, a.orden, a.estado])).toEqual([
      ['10', 1, 'Pendiente'],
      ['11', 2, 'Visitado'],
      ['12', 3, 'Pendiente'],
    ]);
    expect(get).toHaveBeenCalledWith('/visits/agenda', {
      params: { date: '2026-10-26' },
    });
  });
});
