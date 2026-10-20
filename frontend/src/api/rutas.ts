import { apiClient } from './client';
import { IRuta, IParadaRuta, IRutaFormData } from '../types/ruta';
import { useRouteDraftStore } from '../store/useRouteDraftStore';

export const getRutas = async (): Promise<IRuta[]> => {
  try {
    const res = await apiClient.get<IRuta[]>('/rutas');
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    throw new Error('Fallback to mock');
  } catch {
    const draftStore = useRouteDraftStore.getState();
    return [
      {
        id_ruta: 'rut-001',
        codigo: 'RUT-ATL-001',
        nombre: 'Ruta Atlántico Industrial',
        territorio_zona: 'Atlántico Este',
        dia_ejecucion: 'Martes',
        frecuencia: 'Semanal',
        hora_inicio_sugerida: '08:00 AM',
        hora_fin_sugerida: '05:00 PM',
        descripcion: 'Ruta para atención de clientes industriales en el Atlántico Este.',
        id_asesor: 'ase-001',
        asesor_nombre: 'Juan Pérez',
        estado: 'ASIGNADA',
        paradas: draftStore.paradas,
        distancia_km_aprox: 68.5,
        tiempo_estimado_min: 495,
      },
    ];
  }
};

export const crearRuta = async (
  formData: IRutaFormData,
  paradas: IParadaRuta[]
): Promise<IRuta> => {
  const payload = {
    nombre: formData.nombre,
    territorio_zona: formData.territorio_zona,
    dia: formData.dia_ejecucion,
    frecuencia: formData.frecuencia,
    hora_inicio: formData.hora_inicio,
    hora_fin: formData.hora_fin,
    descripcion: formData.descripcion,
    id_asesor: formData.id_asesor,
    paradas: paradas.map((p) => ({
      id_cliente: p.id_cliente,
      orden: p.orden,
      hora_sugerida: p.hora_sugerida,
    })),
  };

  try {
    const { data } = await apiClient.post<IRuta>('/rutas', payload);
    return data;
  } catch {
    return {
      id_ruta: `rut-${Date.now()}`,
      codigo: formData.nombre,
      nombre: formData.nombre,
      territorio_zona: formData.territorio_zona,
      dia_ejecucion: formData.dia_ejecucion,
      frecuencia: (formData.frecuencia as any) || 'Semanal',
      hora_inicio_sugerida: formData.hora_inicio,
      hora_fin_sugerida: formData.hora_fin,
      descripcion: formData.descripcion,
      id_asesor: formData.id_asesor,
      asesor_nombre: 'Juan Pérez',
      estado: 'ASIGNADA',
      paradas,
      distancia_km_aprox: Number((paradas.length * 9.8).toFixed(1)),
      tiempo_estimado_min: paradas.length * 70,
    };
  }
};
