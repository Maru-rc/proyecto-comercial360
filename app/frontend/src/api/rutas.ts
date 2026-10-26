import { apiClient } from './client';
import { IRuta, IParadaRuta, IRutaFormData } from '../types/ruta';

interface BackendRouteRecord {
  id: number;
  name: string;
  zoneId: number | null;
  zoneName?: string | null;
  executionDay: string | null;
  frequency: string | null;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
  status: IRuta['estado'];
  salesRepresentativeId?: number | null;
}

const ZONE_NAME_TO_ID: Record<string, number> = {
  'atlántico norte': 1,
  norte: 1,
  'atlántico sur': 2,
  sur: 2,
  'atlántico este': 3,
  este: 3,
  'atlántico centro': 4,
  centro: 4,
};

function resolveZoneId(territorioZona: string): number {
  const numeric = Number(territorioZona);
  if (!Number.isNaN(numeric) && numeric > 0) return numeric;
  return ZONE_NAME_TO_ID[territorioZona.trim().toLowerCase()] ?? 1;
}

function mapBackendRouteToIRuta(
  record: BackendRouteRecord | IRuta,
  paradas: IParadaRuta[] = [],
): IRuta {
  if ('id_ruta' in record) return record;
  return {
    id_ruta: String(record.id),
    codigo: `RUT-${String(record.id).padStart(3, '0')}`,
    nombre: record.name,
    territorio_zona: record.zoneName || `Zona ${record.zoneId ?? 1}`,
    dia_ejecucion: record.executionDay || 'Lunes',
    frecuencia: (record.frequency as IRuta['frecuencia']) || 'Semanal',
    hora_inicio_sugerida: record.startTime || '08:00',
    hora_fin_sugerida: record.endTime || '17:00',
    descripcion: record.description || '',
    id_asesor: record.salesRepresentativeId
      ? String(record.salesRepresentativeId)
      : undefined,
    estado: record.status || 'BORRADOR',
    paradas,
    distancia_km_aprox: Number((paradas.length * 9.8).toFixed(1)),
    tiempo_estimado_min: paradas.length * 70,
    fecha_creacion: new Date().toISOString().split('T')[0],
  };
}

export const getRutas = async (): Promise<IRuta[]> => {
  const res = await apiClient.get<BackendRouteRecord[]>('/rutas');
  return res.data.map((r) => mapBackendRouteToIRuta(r));
};

const toNumericId = (value: string | undefined, label: string): number => {
  const id = Number(String(value ?? '').replace(/\D/g, ''));
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`${label} inválido: ${value}`);
  }
  return id;
};

export const crearRuta = async (
  formData: IRutaFormData,
  paradas: IParadaRuta[],
): Promise<IRuta> => {
  // 1. HU-07: Crear información general de la ruta
  const { data: created } = await apiClient.post<BackendRouteRecord>('/rutas', {
    nombre: formData.nombre,
    zona_id: resolveZoneId(formData.territorio_zona),
    dia_ejecucion: formData.dia_ejecucion,
    frecuencia: formData.frecuencia,
    hora_inicio: formData.hora_inicio || undefined,
    hora_fin: formData.hora_fin || undefined,
    descripcion: formData.descripcion || undefined,
  });

  const routeId = created.id;

  // 2. HU-08: Asignar y ordenar paradas de la ruta
  if (paradas.length > 0) {
    await apiClient.put(`/rutas/${routeId}/paradas`, {
      paradas: paradas.map((p, idx) => ({
        id_cliente: toNumericId(p.id_cliente, 'Cliente'),
        orden_visita: p.orden || idx + 1,
        hora_sugerida: p.hora_sugerida || undefined,
      })),
    });
  }

  // 3. HU-09: Asignar ruta al asesor comercial si fue seleccionado
  if (formData.id_asesor && paradas.length > 0) {
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 30);

    await apiClient.post(`/rutas/${routeId}/asignar`, {
      id_asesor: toNumericId(formData.id_asesor, 'Asesor'),
      fecha_inicio: start.toISOString().split('T')[0],
      fecha_fin: end.toISOString().split('T')[0],
    });
  }

  return mapBackendRouteToIRuta(created, paradas);
};

export interface IAsesor {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
}

export const getAsesores = async (): Promise<IAsesor[]> => {
  const res = await apiClient.get<IAsesor[]>('/asesores');
  return res.data;
};

export interface IAsesorSchedule {
  id_asesor: string;
  nombre: string;
  email: string;
  telefono: string;
  territorio: string;
  rutasAsignadas: number;
  paradasSemana: number;
  cronograma: {
    lunes: string;
    martes: string;
    miercoles: string;
    jueves: string;
    viernes: string;
  };
}

const DAY_KEYS: Record<string, keyof IAsesorSchedule['cronograma']> = {
  lunes: 'lunes',
  martes: 'martes',
  miercoles: 'miercoles',
  miércoles: 'miercoles',
  jueves: 'jueves',
  viernes: 'viernes',
};

/** Weekly schedule per advisor, built from the routes assigned to each one. */
export const buildAsesoresSchedule = (
  asesores: IAsesor[],
  rutas: IRuta[],
): IAsesorSchedule[] =>
  asesores.map((asesor) => {
    const propias = rutas.filter((r) => r.id_asesor === String(asesor.id));
    const cronograma: IAsesorSchedule['cronograma'] = {
      lunes: '',
      martes: '',
      miercoles: '',
      jueves: '',
      viernes: '',
    };
    for (const ruta of propias) {
      const key = DAY_KEYS[ruta.dia_ejecucion.trim().toLowerCase()];
      if (key) {
        cronograma[key] = cronograma[key]
          ? `${cronograma[key]}, ${ruta.nombre}`
          : ruta.nombre;
      }
    }
    return {
      id_asesor: String(asesor.id),
      nombre: asesor.name,
      email: asesor.email,
      telefono: asesor.phone ?? '',
      territorio:
        [...new Set(propias.map((r) => r.territorio_zona))].join(', ') ||
        'Sin territorio',
      rutasAsignadas: propias.length,
      paradasSemana: propias.reduce((acc, r) => acc + r.paradas.length, 0),
      cronograma,
    };
  });
