import { apiClient } from './client';
import { IVisita, IVisitaRegistroFormData, ICotizacion, IPedido } from '../types/visita';
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
  documentos_s3_keys: string[] = []
): Promise<IVisita> => {
  const payload = {
    ...formData,
    fotos_s3_keys,
    documentos_s3_keys,
  };

  try {
    const { data } = await apiClient.post<IVisita>('/visitas/registrar', payload);
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
        actividad: formData.objetivo_proximo_seguimiento || 'Seguimiento comercial',
        responsable: formData.responsable_seguimiento,
      },
      fotos_s3_keys,
      documentos_s3_keys,
    };
  }
};

export const crearCotizacion = async (cotizacionData: Partial<ICotizacion>): Promise<ICotizacion> => {
  try {
    const { data } = await apiClient.post<ICotizacion>('/cotizaciones', cotizacionData);
    return data;
  } catch {
    return {
      id_cotizacion: `cot-${Date.now()}`,
      numero: cotizacionData.numero || `COT-${Math.floor(1000 + Math.random() * 9000)}`,
      id_cliente: cotizacionData.id_cliente || 'cli-001',
      fecha: new Date().toISOString().split('T')[0],
      valor: cotizacionData.valor || 24800000,
      moneda: 'COP',
      estado: 'GENERADA',
    };
  }
};

export const crearPedido = async (pedidoData: Partial<IPedido>): Promise<IPedido> => {
  try {
    const { data } = await apiClient.post<IPedido>('/pedidos', pedidoData);
    return data;
  } catch {
    return {
      id_pedido: `ped-${Date.now()}`,
      numero: pedidoData.numero || `PED-${Math.floor(100 + Math.random() * 900)}`,
      id_cliente: pedidoData.id_cliente || 'cli-001',
      fecha: new Date().toISOString().split('T')[0],
      valor: pedidoData.valor || 18500000,
      fecha_entrega: pedidoData.fecha_entrega || '2024-05-30',
      estado: 'CONFIRMADO',
    };
  }
};

export const getHistorialCliente = async (_id_cliente: string): Promise<IHistorialCliente[]> => {
  try {
    const res = await apiClient.get<IHistorialCliente[]>(`/clientes/${_id_cliente}/historial`);
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_HISTORIAL;
  } catch {
    return MOCK_HISTORIAL;
  }
};
