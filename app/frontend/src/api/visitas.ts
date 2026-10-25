import { apiClient } from './client';
import {
  IVisitaRegistroFormData,
  IVisitAgendaItemContract,
  IVisitMapStopContract,
} from '../types/visita';

type OutcomeType = 'SUCCESSFUL' | 'NO_SALE' | 'RESCHEDULED' | 'CANCELLED';

export interface IRegistroVisitaResultado {
  visitId: number;
  outcome: OutcomeType;
  quotationId?: number | null;
  orderId?: number | null;
  followUpId?: number | null;
  rescheduledVisitId?: number | null;
}

const toOutcome = (form: IVisitaRegistroFormData): OutcomeType => {
  if (form.estado_visita === 'REPROGRAMADO') return 'RESCHEDULED';
  if (
    form.estado_visita === 'SIN_VISITAR' ||
    form.resultado_visita === 'No visitado'
  )
    return 'CANCELLED';
  if (form.resultado_visita === 'No interesado') return 'NO_SALE';
  return 'SUCCESSFUL';
};

/** "11:30 AM" or "11:30" → "11:30" (24 h). Returns undefined if unparseable. */
const to24h = (hora?: string): string | undefined => {
  const match = /^(\d{1,2}):(\d{2})\s*([AaPp][Mm])?$/.exec((hora ?? '').trim());
  if (!match) return undefined;
  const meridiem = match[3]?.toUpperCase();
  let hours = Number(match[1]);
  if (meridiem) hours = (hours % 12) + (meridiem === 'PM' ? 12 : 0);
  if (hours > 23) return undefined;
  return `${String(hours).padStart(2, '0')}:${match[2]}`;
};

const isImageKey = (key: string) => /\.(jpe?g|png|webp)$/i.test(key);

/**
 * HU-12/13/14: the outcome, quotation, order and follow-up are written by the
 * backend in one transaction. Without a scheduled visit id, an unplanned visit
 * is created first (POST /visits) and then closed with its outcome.
 */
export const registrarVisita = async (
  formData: IVisitaRegistroFormData,
  fotos_s3_keys: string[] = [],
  documentos_s3_keys: string[] = [],
  visitId?: number,
): Promise<IRegistroVisitaResultado> => {
  let id = visitId;
  if (!id) {
    const created = await agendarVisita({
      clientId: Number(formData.id_cliente),
      scheduledDate: formData.fecha_visita,
      startTime: to24h(formData.hora_inicio),
      objective: formData.objetivo_visita || undefined,
    });
    id = created.id;
  }

  const outcome = toOutcome(formData);
  const endTime = to24h(formData.hora_fin);
  const evidence =
    fotos_s3_keys.find(isImageKey) ?? fotos_s3_keys[0] ?? documentos_s3_keys[0];

  const { data } = await apiClient.put<IRegistroVisitaResultado>(
    `/visits/${id}`,
    {
      outcome,
      reasonNoSale:
        outcome === 'NO_SALE' ? formData.observaciones || undefined : undefined,
      observations: formData.observaciones || undefined,
      evidenceS3Key: evidence,
      endTime: endTime ? `${formData.fecha_visita}T${endTime}:00` : undefined,
      rescheduledDate:
        outcome === 'RESCHEDULED'
          ? formData.fecha_proxima_visita || undefined
          : undefined,
      quotation:
        formData.genero_cotizacion &&
        formData.numero_cotizacion &&
        formData.valor_cotizacion
          ? {
              quotationNumber: formData.numero_cotizacion,
              amount: Number(formData.valor_cotizacion),
              currency: 'COP',
            }
          : undefined,
      order:
        formData.genero_pedido &&
        formData.numero_pedido &&
        formData.valor_pedido
          ? {
              orderNumber: formData.numero_pedido,
              amount: Number(formData.valor_pedido),
              estimatedDeliveryDate:
                formData.fecha_estimada_entrega || undefined,
            }
          : undefined,
      followUp:
        outcome !== 'RESCHEDULED' && formData.fecha_proxima_visita
          ? {
              nextContactDate: formData.fecha_proxima_visita,
              activity:
                formData.objetivo_proximo_seguimiento ||
                'Seguimiento comercial',
            }
          : undefined,
    },
  );
  return data;
};

export const getVisitsAgenda = async (
  date?: string,
  advisorId?: number,
): Promise<IVisitAgendaItemContract[]> => {
  const params: Record<string, string | number> = {};
  if (date) params.date = date;
  if (advisorId) params.advisorId = advisorId;

  const res = await apiClient.get<IVisitAgendaItemContract[]>(
    '/visits/agenda',
    { params },
  );
  return Array.isArray(res.data) ? res.data : [];
};

export const getVisitsMap = async (
  date?: string,
  advisorId?: number,
): Promise<IVisitMapStopContract[]> => {
  const params: Record<string, string | number> = {};
  if (date) params.date = date;
  if (advisorId) params.advisorId = advisorId;

  const res = await apiClient.get<IVisitMapStopContract[]>('/visits/map', {
    params,
  });
  return Array.isArray(res.data) ? res.data : [];
};

/** Schedules a visit for the session advisor (HU-11, POST /visits). */
export const agendarVisita = async (input: {
  clientId: number;
  scheduledDate: string;
  startTime?: string;
  objective?: string;
  visitOrder?: number;
}): Promise<{ id: number }> => {
  const { data } = await apiClient.post<{ id: number }>('/visits', input);
  return data;
};

export interface IVisitaDetalle {
  id: number;
  clientId: number;
  advisorId: number;
  routeId: number | null;
  scheduledDate: string;
  startTime: string | null;
  endTime: string | null;
  visitStatus: string;
  objective: string | null;
  observation: string | null;
  evidenceS3Key: string | null;
}

/** HU-24: an advisor only reads their own visits (403 otherwise). */
export const getVisita = async (id: number): Promise<IVisitaDetalle> => {
  const { data } = await apiClient.get<IVisitaDetalle>(`/visits/${id}`);
  return data;
};
