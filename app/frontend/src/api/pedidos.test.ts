import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('./client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn() },
}));

import { apiClient } from './client';
import { crearPedidoApi, getPedidos } from './pedidos';

const get = vi.mocked(apiClient.get);
const post = vi.mocked(apiClient.post);

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

describe('crearPedidoApi', () => {
  afterEach(() => vi.clearAllMocks());

  it('sends no quotationId when the order has no linked quotation', async () => {
    post.mockResolvedValue({ data: order(9, 'PENDING') });

    await crearPedidoApi({
      numero: 'PED-9',
      id_cliente: '1',
      valor: 1000,
      id_cotizacion: '',
    });

    expect(post.mock.calls[0][1]).toMatchObject({ quotationId: undefined });
  });
});
