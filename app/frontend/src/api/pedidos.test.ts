import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('./client', () => ({
  apiClient: { get: vi.fn() },
}));

import { apiClient } from './client';
import { getPedidos } from './pedidos';

const get = vi.mocked(apiClient.get);

const order = (id: number, status: string) => ({
  id,
  number: `PED-${id}`,
  clientId: 1,
  clientName: 'Cliente',
  amount: 1000,
  status,
  date: '2026-10-26',
});

describe('getPedidos', () => {
  afterEach(() => vi.clearAllMocks());

  it('shows orders closed during a visit (CERRADO) as PENDIENTE and keeps them under that filter', async () => {
    get.mockResolvedValue({
      data: [order(1, 'CERRADO'), order(2, 'DELIVERED'), order(3, 'PENDING')],
    });

    const todos = await getPedidos();
    expect(todos.map((p) => [p.numero, p.estado])).toEqual([
      ['PED-1', 'PENDIENTE'],
      ['PED-2', 'ENTREGADO'],
      ['PED-3', 'PENDIENTE'],
    ]);

    const pendientes = await getPedidos({ estado: 'PENDIENTE' });
    expect(pendientes.map((p) => p.numero)).toEqual(['PED-1', 'PED-3']);
  });
});
