import { apiClient } from './client';
import { IPedido } from '../types/visita';

export const MOCK_PEDIDOS: IPedido[] = [
  {
    id_pedido: 'ped-1',
    numero: 'PED-568',
    id_cliente: 'cli-001',
    cliente_nombre: 'Metalúrgicas S.A.S',
    id_cotizacion: 'COT-1242',
    fecha: '2024-05-21',
    fecha_entrega: '2024-05-30',
    valor: 18500000,
    estado: 'PENDIENTE',
    asesor_nombre: 'Juan Pérez',
    items_count: 4,
    observaciones: 'Despacho prioritario en planta Barranquilla',
  },
  {
    id_pedido: 'ped-2',
    numero: 'PED-567',
    id_cliente: 'cli-002',
    cliente_nombre: 'Ferretería del Norte S.A.',
    id_cotizacion: 'COT-1241',
    fecha: '2024-05-20',
    fecha_entrega: '2024-05-26',
    valor: 12600000,
    estado: 'EN_PREPARACION',
    asesor_nombre: 'Juan Pérez',
    items_count: 8,
    observaciones: 'Empaque especial para distribución mayorista',
  },
  {
    id_pedido: 'ped-3',
    numero: 'PED-565',
    id_cliente: 'cli-003',
    cliente_nombre: 'Aceros del Caribe Ltda.',
    id_cotizacion: 'COT-1237',
    fecha: '2024-05-19',
    fecha_entrega: '2024-05-24',
    valor: 41200000,
    estado: 'DESPACHADO',
    asesor_nombre: 'Juan Pérez',
    items_count: 2,
    observaciones: 'Transporte de carga pesada asignado',
  },
  {
    id_pedido: 'ped-4',
    numero: 'PED-560',
    id_cliente: 'cli-005',
    cliente_nombre: 'ConstruInnova S.A.S',
    id_cotizacion: 'COT-1232',
    fecha: '2024-05-16',
    fecha_entrega: '2024-05-20',
    valor: 16800000,
    estado: 'ENTREGADO',
    asesor_nombre: 'Juan Pérez',
    items_count: 5,
    observaciones: 'Recibido a satisfacción por Carlos Julio Mendoza',
  },
  {
    id_pedido: 'ped-5',
    numero: 'PED-558',
    id_cliente: 'cli-010',
    cliente_nombre: 'Prodeco Ltda.',
    id_cotizacion: 'COT-1229',
    fecha: '2024-05-14',
    fecha_entrega: '2024-05-19',
    valor: 22400000,
    estado: 'ENTREGADO',
    asesor_nombre: 'Carlos Gómez',
    items_count: 6,
    observaciones: 'Entrega en Zona Industrial Soledad',
  },
  {
    id_pedido: 'ped-6',
    numero: 'PED-554',
    id_cliente: 'cli-009',
    cliente_nombre: 'Ferretería Central',
    id_cotizacion: 'COT-1225',
    fecha: '2024-05-11',
    fecha_entrega: '2024-05-18',
    valor: 9500000,
    estado: 'ENTREGADO',
    asesor_nombre: 'María Rodríguez',
    items_count: 3,
    observaciones: 'Firma de remisión archivada',
  },
];

export const getPedidos = async (params?: {
  search?: string;
  estado?: string;
}): Promise<IPedido[]> => {
  try {
    const res = await apiClient.get<IPedido[]>('/pedidos', { params });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    throw new Error('Fallback to mock');
  } catch {
    let result = [...MOCK_PEDIDOS];
    if (params?.search) {
      const q = params.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.numero.toLowerCase().includes(q) ||
          (p.cliente_nombre && p.cliente_nombre.toLowerCase().includes(q)),
      );
    }
    if (params?.estado && params.estado !== 'Todos') {
      result = result.filter((p) => p.estado === params.estado);
    }
    return result;
  }
};

export const crearPedidoApi = async (
  data: Partial<IPedido>,
): Promise<IPedido> => {
  const newPed: IPedido = {
    id_pedido: `ped-${Date.now()}`,
    numero: data.numero || `PED-${Math.floor(100 + Math.random() * 900)}`,
    id_cliente: data.id_cliente || 'cli-001',
    cliente_nombre: data.cliente_nombre || 'Cliente Comercial',
    id_cotizacion: data.id_cotizacion,
    fecha: data.fecha || new Date().toISOString().split('T')[0],
    fecha_entrega:
      data.fecha_entrega ||
      new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    valor: Number(data.valor || 10000000),
    estado: (data.estado as any) || 'PENDIENTE',
    asesor_nombre: data.asesor_nombre || 'Juan Pérez',
    items_count: data.items_count || 1,
    observaciones:
      data.observaciones || 'Pedido creado desde el sistema comercial',
  };

  try {
    const res = await apiClient.post<IPedido>('/pedidos', newPed);
    MOCK_PEDIDOS.unshift(res.data);
    return res.data;
  } catch {
    MOCK_PEDIDOS.unshift(newPed);
    return newPed;
  }
};
