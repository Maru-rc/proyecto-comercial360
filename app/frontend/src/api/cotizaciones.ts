import { apiClient } from './client';
import { ICotizacion } from '../types/visita';

type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

interface QuotationResponse {
  id: number;
  number: string;
  clientId: number;
  clientName?: string | null;
  advisorId?: number | null;
  visitId?: number | null;
  amount: number;
  currency: string;
  status: QuotationStatus;
  date: string;
}

const STATUS_TO_ES: Record<QuotationStatus, string> = {
  DRAFT: 'BORRADOR',
  SENT: 'ENVIADA',
  ACCEPTED: 'APROBADA',
  REJECTED: 'RECHAZADA',
  EXPIRED: 'VENCIDA',
};

const STATUS_FROM_ES: Record<string, QuotationStatus> = Object.fromEntries(
  Object.entries(STATUS_TO_ES).map(([en, es]) => [es, en as QuotationStatus]),
);

const toCotizacion = (q: QuotationResponse): ICotizacion => ({
  id_cotizacion: String(q.id),
  numero: q.number,
  id_cliente: String(q.clientId),
  cliente_nombre: q.clientName ?? `Cliente #${q.clientId}`,
  id_asesor: q.advisorId ? String(q.advisorId) : undefined,
  fecha: String(q.date).slice(0, 10),
  valor: Number(q.amount),
  moneda: q.currency,
  estado: STATUS_TO_ES[q.status] ?? q.status,
});

export const getCotizaciones = async (params?: {
  search?: string;
  estado?: string;
}): Promise<ICotizacion[]> => {
  const { data } = await apiClient.get<QuotationResponse[]>(
    '/commercial/quotations',
    { params: { limit: 100 } },
  );
  let result = data.map(toCotizacion);
  if (params?.search) {
    const q = params.search.toLowerCase();
    result = result.filter(
      (c) =>
        c.numero.toLowerCase().includes(q) ||
        (c.cliente_nombre ?? '').toLowerCase().includes(q),
    );
  }
  if (params?.estado && params.estado !== 'Todos') {
    result = result.filter((c) => c.estado === params.estado);
  }
  return result;
};

export const crearCotizacionApi = async (
  data: Partial<ICotizacion>,
): Promise<ICotizacion> => {
  const { data: created } = await apiClient.post<QuotationResponse>(
    '/commercial/quotations',
    {
      quotationNumber: data.numero,
      clientId: Number(data.id_cliente),
      amount: Number(data.valor),
      currency: 'COP',
      status: data.estado ? STATUS_FROM_ES[data.estado] : undefined,
      date: data.fecha,
    },
  );
  return toCotizacion(created);
};
