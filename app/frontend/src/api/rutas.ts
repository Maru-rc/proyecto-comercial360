import { apiClient } from './client';
import { IRuta, IParadaRuta, IRutaFormData } from '../types/ruta';
import { useRouteDraftStore } from '../store/useRouteDraftStore';

export const MOCK_RUTAS_ASIGNADAS: IRuta[] = [
  {
    id_ruta: 'rut-001',
    codigo: 'RUT-ATL-001',
    nombre: 'Ruta Atlántico Industrial',
    territorio_zona: 'Atlántico Este',
    dia_ejecucion: 'Martes',
    frecuencia: 'Semanal',
    hora_inicio_sugerida: '08:00 AM',
    hora_fin_sugerida: '05:00 PM',
    descripcion:
      'Ruta para atención de cuentas industriales prioritarias en Barranquilla y Soledad.',
    id_asesor: 'ase-001',
    asesor_nombre: 'Juan Pérez',
    estado: 'EN_CURSO',
    paradas: [],
    distancia_km_aprox: 68.5,
    tiempo_estimado_min: 495,
    fecha_creacion: '2024-05-18',
  },
  {
    id_ruta: 'rut-002',
    codigo: 'RUT-ATL-002',
    nombre: 'Ruta Ferretera Norte',
    territorio_zona: 'Atlántico Norte',
    dia_ejecucion: 'Miércoles',
    frecuencia: 'Semanal',
    hora_inicio_sugerida: '08:30 AM',
    hora_fin_sugerida: '04:30 PM',
    descripcion: 'Distribuidores y ferreterías medianas del corredor norte.',
    id_asesor: 'ase-001',
    asesor_nombre: 'Juan Pérez',
    estado: 'ASIGNADA',
    paradas: [],
    distancia_km_aprox: 44.2,
    tiempo_estimado_min: 390,
    fecha_creacion: '2024-05-19',
  },
  {
    id_ruta: 'rut-003',
    codigo: 'RUT-ATL-003',
    nombre: 'Ruta Soledad & Malambo',
    territorio_zona: 'Atlántico Sur',
    dia_ejecucion: 'Jueves',
    frecuencia: 'Semanal',
    hora_inicio_sugerida: '08:00 AM',
    hora_fin_sugerida: '05:30 PM',
    descripcion:
      'Clientes industriales y comercio general en el sector sur metropolitano.',
    id_asesor: 'ase-002',
    asesor_nombre: 'Carlos Gómez',
    estado: 'ASIGNADA',
    paradas: [],
    distancia_km_aprox: 72.0,
    tiempo_estimado_min: 510,
    fecha_creacion: '2024-05-19',
  },
  {
    id_ruta: 'rut-004',
    codigo: 'RUT-ATL-004',
    nombre: 'Ruta Centro Mayorista',
    territorio_zona: 'Atlántico Centro',
    dia_ejecucion: 'Viernes',
    frecuencia: 'Quincenal',
    hora_inicio_sugerida: '09:00 AM',
    hora_fin_sugerida: '04:00 PM',
    descripcion:
      'Puntos de venta minorista y depósitos en el centro comercial.',
    id_asesor: 'ase-003',
    asesor_nombre: 'María Rodríguez',
    estado: 'ASIGNADA',
    paradas: [],
    distancia_km_aprox: 31.8,
    tiempo_estimado_min: 340,
    fecha_creacion: '2024-05-17',
  },
  {
    id_ruta: 'rut-005',
    codigo: 'RUT-ATL-005',
    nombre: 'Ruta Especial Vía 40',
    territorio_zona: 'Atlántico Norte',
    dia_ejecucion: 'Lunes',
    frecuencia: 'Semanal',
    hora_inicio_sugerida: '08:00 AM',
    hora_fin_sugerida: '03:30 PM',
    descripcion: 'Grandes plantas de producción del corredor portuario.',
    id_asesor: 'ase-004',
    asesor_nombre: 'Roberto Silva',
    estado: 'COMPLETADA',
    paradas: [],
    distancia_km_aprox: 55.4,
    tiempo_estimado_min: 420,
    fecha_creacion: '2024-05-15',
  },
];

export interface IAsesorSchedule {
  id_asesor: string;
  nombre: string;
  email: string;
  telefono: string;
  territorio: string;
  avatarUrl: string;
  cumplimientoSemanal: number;
  visitasAsignadas: number;
  visitasCompletadas: number;
  estadoActual: 'En ruta' | 'En oficina' | 'Planificando';
  cronograma: {
    lunes: string;
    martes: string;
    miercoles: string;
    jueves: string;
    viernes: string;
  };
}

export const MOCK_ASESORES_SCHEDULE: IAsesorSchedule[] = [
  {
    id_asesor: 'ase-001',
    nombre: 'Juan Pérez',
    email: 'jperez@comercial360.com',
    telefono: '300 123 4567',
    territorio: 'Atlántico Norte & Este',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    cumplimientoSemanal: 78,
    visitasAsignadas: 24,
    visitasCompletadas: 19,
    estadoActual: 'En ruta',
    cronograma: {
      lunes: 'RUT-ATL-005 (Vía 40)',
      martes: 'RUT-ATL-001 (Industrial)',
      miercoles: 'RUT-ATL-002 (Ferretera Norte)',
      jueves: 'Seguimiento & Cotizaciones',
      viernes: 'Cierre comercial & Oficina',
    },
  },
  {
    id_asesor: 'ase-002',
    nombre: 'Carlos Gómez',
    email: 'cgomez@comercial360.com',
    telefono: '310 987 6543',
    territorio: 'Atlántico Sur (Soledad/Malambo)',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    cumplimientoSemanal: 85,
    visitasAsignadas: 26,
    visitasCompletadas: 22,
    estadoActual: 'En ruta',
    cronograma: {
      lunes: 'Planificación semanal',
      martes: 'Ruta Malambo Industrial',
      miercoles: 'Ruta Soledad 1',
      jueves: 'RUT-ATL-003 (Soledad & Malambo)',
      viernes: 'Ruta Clientes Especiales',
    },
  },
  {
    id_asesor: 'ase-003',
    nombre: 'María Rodríguez',
    email: 'mrodriguez@comercial360.com',
    telefono: '315 456 7890',
    territorio: 'Atlántico Centro',
    avatarUrl:
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    cumplimientoSemanal: 91,
    visitasAsignadas: 22,
    visitasCompletadas: 20,
    estadoActual: 'En oficina',
    cronograma: {
      lunes: 'Ruta Centro Norte',
      martes: 'Ruta Calle 30',
      miercoles: 'Seguimientos telefónicos',
      jueves: 'Ruta Centro Comercial',
      viernes: 'RUT-ATL-004 (Centro Mayorista)',
    },
  },
  {
    id_asesor: 'ase-004',
    nombre: 'Roberto Silva',
    email: 'rsilva@comercial360.com',
    telefono: '320 123 9988',
    territorio: 'Atlántico Norte',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    cumplimientoSemanal: 72,
    visitasAsignadas: 20,
    visitasCompletadas: 14,
    estadoActual: 'Planificando',
    cronograma: {
      lunes: 'RUT-ATL-005 (Vía 40)',
      martes: 'Ruta Puerto Industrial',
      miercoles: 'Demostración en sitio',
      jueves: 'Ruta Riomar & Villa Santos',
      viernes: 'Consolidación de pedidos',
    },
  },
];

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
  try {
    const res =
      await apiClient.get<Array<BackendRouteRecord | IRuta>>('/rutas');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((r) => mapBackendRouteToIRuta(r));
    }
    throw new Error('Fallback to mock');
  } catch {
    const draftStore = useRouteDraftStore.getState();
    const dynamicRutas = [...MOCK_RUTAS_ASIGNADAS];
    if (draftStore.paradas && draftStore.paradas.length > 0) {
      dynamicRutas[0].paradas = draftStore.paradas;
    }
    return dynamicRutas;
  }
};

export const crearRuta = async (
  formData: IRutaFormData,
  paradas: IParadaRuta[],
): Promise<IRuta> => {
  try {
    // 1. HU-07: Crear información general de la ruta
    const { data: created } = await apiClient.post<BackendRouteRecord>(
      '/rutas',
      {
        nombre: formData.nombre,
        zona_id: resolveZoneId(formData.territorio_zona),
        dia_ejecucion: formData.dia_ejecucion,
        frecuencia: formData.frecuencia,
        hora_inicio: formData.hora_inicio || undefined,
        hora_fin: formData.hora_fin || undefined,
        descripcion: formData.descripcion || undefined,
      },
    );

    const routeId = created.id;

    // 2. HU-08: Asignar y ordenar paradas de la ruta
    if (routeId && paradas.length > 0) {
      await apiClient.put(`/rutas/${routeId}/paradas`, {
        paradas: paradas.map((p, idx) => ({
          id_cliente:
            Number(String(p.id_cliente).replace(/\D/g, '')) || idx + 1,
          orden_visita: p.orden || idx + 1,
          hora_sugerida: p.hora_sugerida || undefined,
        })),
      });
    }

    // 3. HU-09: Asignar ruta al asesor comercial si fue seleccionado
    if (routeId && formData.id_asesor && paradas.length > 0) {
      const advisorId =
        Number(String(formData.id_asesor).replace(/\D/g, '')) || 1;
      const start = new Date();
      const end = new Date();
      end.setDate(start.getDate() + 30);

      await apiClient.post(`/rutas/${routeId}/asignar`, {
        id_asesor: advisorId,
        fecha_inicio: start.toISOString().split('T')[0],
        fecha_fin: end.toISOString().split('T')[0],
      });
    }

    const mapped = mapBackendRouteToIRuta(created, paradas);
    MOCK_RUTAS_ASIGNADAS.unshift(mapped);
    return mapped;
  } catch {
    const newRuta: IRuta = {
      id_ruta: `rut-${Date.now()}`,
      codigo: `RUT-${formData.territorio_zona.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      nombre: formData.nombre,
      territorio_zona: formData.territorio_zona,
      dia_ejecucion: formData.dia_ejecucion,
      frecuencia: (formData.frecuencia as IRuta['frecuencia']) || 'Semanal',
      hora_inicio_sugerida: formData.hora_inicio,
      hora_fin_sugerida: formData.hora_fin,
      descripcion: formData.descripcion,
      id_asesor: formData.id_asesor || 'ase-001',
      asesor_nombre: 'Juan Pérez',
      estado: 'ASIGNADA',
      paradas,
      distancia_km_aprox: Number((paradas.length * 9.8).toFixed(1)),
      tiempo_estimado_min: paradas.length * 70,
      fecha_creacion: new Date().toISOString().split('T')[0],
    };
    MOCK_RUTAS_ASIGNADAS.unshift(newRuta);
    return newRuta;
  }
};
