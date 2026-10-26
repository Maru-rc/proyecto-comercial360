import { apiClient } from './client';
import { IPedido } from '../types/visita';

type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROCESS'
  | 'DISPATCHED'
  | 'DELIVERED'
  | 'CANCELLED'
  // Pedidos creados al registrar una visita (default de la tabla orders)
  | 'CERRADO';

interface OrderResponse {
  id: number;
  number: string;
  clientId: number;
  clientName?: string | null;
  quotationId?: number | null;
  amount: number;
  status: OrderStatus;
  date: string;
  estimatedDeliveryDate?: string | null;
}

const STATUS_TO_ES: Record<OrderStatus, string> = {
  PENDING: 'PENDIENTE',
  CONFIRMED: 'PENDIENTE',
  IN_PROCESS: 'EN_PREPARACION',
  DISPATCHED: 'DESPACHADO',
  DELIVERED: 'ENTREGADO',
  CANCELLED: 'CANCELADO',
  // Venta cerrada en la visita: queda pendiente de alistar y entregar
  CERRADO: 'PENDIENTE',
};

const STATUS_FROM_ES: Record<string, OrderStatus> = {
  PENDIENTE: 'PENDING',
  EN_PREPARACION: 'IN_PROCESS',
  DESPACHADO: 'DISPATCHED',
  ENTREGADO: 'DELIVERED',
  CANCELADO: 'CANCELLED',
};

const toPedido = (o: OrderResponse): IPedido => ({
  id_pedido: String(o.id),
  numero: o.number,
  id_cliente: String(o.clientId),
  cliente_nombre: o.clientName ?? `Cliente #${o.clientId}`,
  id_cotizacion: o.quotationId ? String(o.quotationId) : undefined,
  fecha: String(o.date).slice(0, 10),
  fecha_entrega: o.estimatedDeliveryDate
    ? String(o.estimatedDeliveryDate).slice(0, 10)
    : undefined,
  valor: Number(o.amount),
  estado: STATUS_TO_ES[o.status] ?? o.status,
});

export const getPedidos = async (params?: {
  search?: string;
  estado?: string;
}): Promise<IPedido[]> => {
  const { data } = await apiClient.get<OrderResponse[]>('/commercial/orders', {
    params: { limit: 100 },
  });
  let result = data.map(toPedido);
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.numero.toLowerCase().includes(q) ||
        (p.cliente_nombre ?? '').toLowerCase().includes(q),
    );
  }
  if (params?.estado && params.estado !== 'Todos') {
    result = result.filter((p) => p.estado === params.estado);
  }
  return result;
};

export const crearPedidoApi = async (
  data: Partial<IPedido>,
): Promise<IPedido> => {
  const quotationId = Number(data.id_cotizacion);
  const { data: created } = await apiClient.post<OrderResponse>(
    '/commercial/orders',
    {
      orderNumber: data.numero,
      clientId: Number(data.id_cliente),
      quotationId: Number.isInteger(quotationId) ? quotationId : undefined,
      amount: Number(data.valor),
      status: data.estado ? STATUS_FROM_ES[data.estado] : undefined,
      date: data.fecha,
      estimatedDeliveryDate: data.fecha_entrega,
    },
  );
  return toPedido(created);
};
