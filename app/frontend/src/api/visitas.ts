import { apiClient } from './client';
import {
  IVisita,
  IVisitaRegistroFormData,
  ICotizacion,
  IPedido,
  IVisitAgendaItemContract,
  IVisitMapStopContract,
} from '../types/visita';
import { IHistorialCliente } from '../types/cliente';

export const MOCK_HISTORIAL: IHistorialCliente[] = [
  {
    id_historial: 'hist-1',
    id_cliente: 'cli-001',
    fecha: '14/05/2024',
    accion: 'Visita realizada',
    usuario: 'Juan Pérez',
    descripcion: 'Resultado: Interesado. Presentación inicial del catálogo.',
  },
  {
    id_historial: 'hist-2',
    id_cliente: 'cli-001',
    fecha: '07/05/2024',
    accion: 'Cotización enviada',
    usuario: 'Juan Pérez',
    descripcion: 'COT-1241 | $ 12,600,000 en equipos industriales.',
  },
  {
    id_historial: 'hist-3',
    id_cliente: 'cli-001',
    fecha: '30/04/2024',
    accion: 'Seguimiento telefónico',
    usuario: 'Juan Pérez',
    descripcion: 'Pendiente de respuesta de la junta directiva.',
  },
];

export const registrarVisita = async (
  formData: IVisitaRegistroFormData,
  fotos_s3_keys: string[] = [],
  documentos_s3_keys: string[] = [],
): Promise<IVisita> => {
  const payload = {
    ...formData,
    fotos_s3_keys,
    documentos_s3_keys,
  };

  try {
    const { data } = await apiClient.post<IVisita>(
      '/visitas/registrar',
      payload,
    );
    return data;
  } catch {
    return {
      id_visita: `vis-${Date.now()}`,
      id_cliente: formData.id_cliente,
      id_asesor: 'ase-001',
      asesor_nombre: formData.asesor_nombre,
      id_ruta: formData.id_ruta,
      territorio: formData.territorio,
      semana: formData.semana,
      dia: formData.dia,
      fecha_programada: formData.fecha_visita,
      fecha_real: formData.fecha_visita,
      hora_inicio: formData.hora_inicio,
      hora_fin: formData.hora_fin,
      estado_visita: formData.estado_visita,
      resultado: formData.resultado_visita,
      objetivo_visita: formData.objetivo_visita,
      tipo_visita: formData.tipo_visita,
      interes_productos: formData.interes_productos as any,
      modulo_interes: formData.modulo_interes,
      competencia_mencionada: formData.competencia_mencionada,
      observaciones: formData.observaciones,
      cotizacion: formData.genero_cotizacion
        ? {
            numero: formData.numero_cotizacion || 'COT-1242',
            id_cliente: formData.id_cliente,
            fecha: formData.fecha_visita,
            valor: Number(formData.valor_cotizacion || 24800000),
            moneda: formData.moneda || 'COP',
          }
        : undefined,
      pedido: formData.genero_pedido
        ? {
            numero: formData.numero_pedido || 'PED-568',
            id_cliente: formData.id_cliente,
            fecha: formData.fecha_visita,
            valor: Number(formData.valor_pedido || 18500000),
            fecha_entrega: formData.fecha_estimada_entrega || '30/05/2024',
          }
        : undefined,
      seguimiento: {
        fecha_proxima: formData.fecha_proxima_visita,
        hora_proxima: formData.hora_proxima_visita,
        actividad:
          formData.objetivo_proximo_seguimiento || 'Seguimiento comercial',
        responsable: formData.responsable_seguimiento,
      },
      fotos_s3_keys,
      documentos_s3_keys,
    };
  }
};

export const crearCotizacion = async (
  cotizacionData: Partial<ICotizacion>,
): Promise<ICotizacion> => {
  try {
    const { data } = await apiClient.post<ICotizacion>(
      '/cotizaciones',
      cotizacionData,
    );
    return data;
  } catch {
    return {
      id_cotizacion: `cot-${Date.now()}`,
      numero:
        cotizacionData.numero ||
        `COT-${Math.floor(1000 + Math.random() * 9000)}`,
      id_cliente: cotizacionData.id_cliente || 'cli-001',
      fecha: new Date().toISOString().split('T')[0],
      valor: cotizacionData.valor || 24800000,
      moneda: 'COP',
      estado: 'GENERADA',
    };
  }
};

export const crearPedido = async (
  pedidoData: Partial<IPedido>,
): Promise<IPedido> => {
  try {
    const { data } = await apiClient.post<IPedido>('/pedidos', pedidoData);
    return data;
  } catch {
    return {
      id_pedido: `ped-${Date.now()}`,
      numero:
        pedidoData.numero || `PED-${Math.floor(100 + Math.random() * 900)}`,
      id_cliente: pedidoData.id_cliente || 'cli-001',
      fecha: new Date().toISOString().split('T')[0],
      valor: pedidoData.valor || 18500000,
      fecha_entrega: pedidoData.fecha_entrega || '2024-05-30',
      estado: 'CONFIRMADO',
    };
  }
};

export const getHistorialCliente = async (
  _id_cliente: string,
): Promise<IHistorialCliente[]> => {
  try {
    const res = await apiClient.get<IHistorialCliente[]>(
      `/clientes/${_id_cliente}/historial`,
    );
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_HISTORIAL;
  } catch {
    return MOCK_HISTORIAL;
  }
};

export const MOCK_MAP_STOPS: IVisitMapStopContract[] = [
  {
    id: 1,
    clientId: 1,
    clientName: 'Distribuidora Ferretera del Norte',
    address: 'Calle 84 # 42-15, Barranquilla',
    order: 1,
    latitude: 11.0045,
    longitude: -74.8192,
    pinStatus: 'VISITED',
    color: 'green',
    colorHex: '#22c55e',
  },
  {
    id: 2,
    clientId: 2,
    clientName: 'Metalúrgicas S.A.S',
    address: 'Cra 38 # 74-120, Barranquilla',
    order: 2,
    latitude: 10.9878,
    longitude: -74.7889,
    pinStatus: 'VISITED',
    color: 'green',
    colorHex: '#22c55e',
  },
  {
    id: 3,
    clientId: 3,
    clientName: 'ConstruInnova S.A.S',
    address: 'Calle 30 # 12-50, Soledad',
    order: 3,
    latitude: 10.9234,
    longitude: -74.7556,
    pinStatus: 'PENDING',
    color: 'orange',
    colorHex: '#f97316',
  },
  {
    id: 4,
    clientId: 4,
    clientName: 'Soluciones Industriales de la Costa',
    address: 'Cra 21 # 30-45, Barranquilla',
    order: 4,
    latitude: 10.9182,
    longitude: -74.7645,
    pinStatus: 'ORDER_CLOSED',
    color: 'blue',
    colorHex: '#3b82f6',
  },
  {
    id: 5,
    clientId: 5,
    clientName: 'ACEROS DEL CARIBE LTDA',
    address: 'Vía 40 # 65-200, Barranquilla',
    order: 5,
    latitude: 10.9754,
    longitude: -74.7721,
    pinStatus: 'PENDING',
    color: 'orange',
    colorHex: '#f97316',
  },
  {
    id: 6,
    clientId: 6,
    clientName: 'Distribuciones JM y Cía',
    address: 'Cra 5 # 18-60, Malambo',
    order: 6,
    latitude: 10.8621,
    longitude: -74.7733,
    pinStatus: 'RESCHEDULED',
    color: 'red',
    colorHex: '#ef4444',
  },
];

export const getVisitsAgenda = async (
  date?: string,
  advisorId?: number,
): Promise<IVisitAgendaItemContract[]> => {
  const params: Record<string, string | number> = {};
  if (date) params.date = date;
  if (advisorId) params.advisorId = advisorId;

  try {
    const res = await apiClient.get<IVisitAgendaItemContract[]>(
      '/visits/agenda',
      { params },
    );
    if (Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch {
    return [];
  }
};

export const getVisitsMap = async (
  date?: string,
  advisorId?: number,
): Promise<IVisitMapStopContract[]> => {
  const params: Record<string, string | number> = {};
  if (date) params.date = date;
  if (advisorId) params.advisorId = advisorId;

  try {
    const res = await apiClient.get<IVisitMapStopContract[]>('/visits/map', {
      params,
    });
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_MAP_STOPS;
  } catch {
    return MOCK_MAP_STOPS;
  }
};
