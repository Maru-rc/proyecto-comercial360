import { describe, it, expect, vi, afterEach } from 'vitest';

vi.mock('./client', () => ({
  apiClient: { post: vi.fn(), put: vi.fn(), get: vi.fn() },
}));

import { apiClient } from './client';
import {
  buildAsesoresSchedule,
  crearRuta,
  estadoRuta,
  getParadasRuta,
  type IAsesor,
} from './rutas';
import { generarNumeroDocumento } from './document-number';
import type { IParadaRuta, IRuta, IRutaFormData } from '../types/ruta';

const post = vi.mocked(apiClient.post);
const put = vi.mocked(apiClient.put);
const get = vi.mocked(apiClient.get);

describe('estadoRuta', () => {
  it('a BORRADOR route is shown as Borrador, not as Asignada', () => {
    expect(estadoRuta('BORRADOR')).toEqual({
      etiqueta: 'Borrador',
      variante: 'default',
    });
    expect(estadoRuta('ASIGNADA').etiqueta).toBe('Asignada');
    expect(estadoRuta('EN_CURSO').etiqueta).toBe('En curso');
    expect(estadoRuta('COMPLETADA').etiqueta).toBe('Completada');
  });
});

describe('getParadasRuta', () => {
  afterEach(() => vi.clearAllMocks());

  it('returns the saved stops in visit order with HH:mm times', async () => {
    get.mockResolvedValue({
      data: {
        id: 7,
        name: 'Ruta',
        paradas: [
          { customerId: 5, visitOrder: 2, suggestedTime: '10:00:00' },
          { customerId: 3, visitOrder: 1, suggestedTime: '09:00:00' },
          { customerId: 9, visitOrder: 3, suggestedTime: null },
        ],
      },
    });

    const paradas = await getParadasRuta('7');

    expect(get).toHaveBeenCalledWith('/rutas/7');
    expect(paradas).toEqual([
      { id_cliente: '3', orden: 1, hora_sugerida: '09:00' },
      { id_cliente: '5', orden: 2, hora_sugerida: '10:00' },
      { id_cliente: '9', orden: 3, hora_sugerida: null },
    ]);
  });

  it('a route without stops returns an empty list', async () => {
    get.mockResolvedValue({ data: { id: 8, name: 'Vacía' } });
    expect(await getParadasRuta('8')).toEqual([]);
  });
});

const ruta = (overrides: Partial<IRuta>): IRuta => ({
  id_ruta: '1',
  codigo: 'RUT-001',
  nombre: 'Ruta',
  territorio_zona: 'Norte',
  dia_ejecucion: 'Lunes',
  frecuencia: 'Semanal',
  hora_inicio_sugerida: '08:00',
  hora_fin_sugerida: '17:00',
  descripcion: '',
  estado: 'ASIGNADA',
  paradas: [],
  distancia_km_aprox: 0,
  tiempo_estimado_min: 0,
  ...overrides,
});

describe('buildAsesoresSchedule', () => {
  const asesores: IAsesor[] = [
    { id: 1, name: 'Ana', email: 'a@x', phone: null, isActive: true },
    { id: 2, name: 'Beto', email: 'b@x', phone: '3', isActive: true },
  ];

  it('places each assigned route on its weekday, only for its advisor', () => {
    const [ana, beto] = buildAsesoresSchedule(asesores, [
      ruta({ nombre: 'Centro', id_asesor: '1', dia_ejecucion: 'Lunes' }),
      ruta({
        nombre: 'Puerto',
        id_asesor: '1',
        dia_ejecucion: 'Miércoles',
        territorio_zona: 'Sur',
      }),
      ruta({ nombre: 'Malambo', id_asesor: '1', dia_ejecucion: 'Lunes' }),
      ruta({ nombre: 'Sin dueño', dia_ejecucion: 'Martes' }),
    ]);

    expect(ana.cronograma).toEqual({
      lunes: 'Centro, Malambo',
      martes: '',
      miercoles: 'Puerto',
      jueves: '',
      viernes: '',
    });
    expect(ana.rutasAsignadas).toBe(3);
    expect(ana.territorio).toBe('Norte, Sur');
    expect(beto.rutasAsignadas).toBe(0);
    expect(beto.territorio).toBe('Sin territorio');
  });
});

describe('crearRuta (HU-07/08/09)', () => {
  afterEach(() => vi.clearAllMocks());

  const form: IRutaFormData = {
    nombre: 'Ruta Norte',
    territorio_zona: 'Atlántico Norte',
    dia_ejecucion: 'Lunes',
    frecuencia: 'Semanal',
    hora_inicio: '08:00',
    hora_fin: '17:00',
    descripcion: '',
    id_asesor: '1',
  };
  const parada = (id_cliente: string, orden: number, hora: string) =>
    ({
      id: `stop-${orden}`,
      id_cliente,
      orden,
      hora_sugerida: hora,
    }) as IParadaRuta;

  it('saves the stops with orden and HH:mm, then assigns the advisor', async () => {
    post
      .mockResolvedValueOnce({
        data: { id: 9, name: 'Ruta Norte', status: 'BORRADOR' },
      })
      .mockResolvedValueOnce({ data: {} });
    put.mockResolvedValue({ data: {} });

    await crearRuta(form, [parada('2', 1, '09:00'), parada('3', 2, '10:00')]);

    // The backend whitelists `orden`: `orden_visita` was rejected with a 400
    expect(put).toHaveBeenCalledWith('/rutas/9/paradas', {
      paradas: [
        { id_cliente: 2, orden: 1, hora_sugerida: '09:00' },
        { id_cliente: 3, orden: 2, hora_sugerida: '10:00' },
      ],
    });
    expect(post).toHaveBeenLastCalledWith(
      '/rutas/9/asignar',
      expect.objectContaining({ id_asesor: 1 }),
    );
  });

  it('does not assign the advisor when saving the stops fails', async () => {
    post.mockResolvedValueOnce({
      data: { id: 9, name: 'Ruta Norte', status: 'BORRADOR' },
    });
    put.mockRejectedValue(new Error('400'));

    await expect(crearRuta(form, [parada('2', 1, '09:00')])).rejects.toThrow(
      '400',
    );
    expect(post).toHaveBeenCalledTimes(1);
  });
});

describe('generarNumeroDocumento', () => {
  it('builds PREFIX-YYYYMMDD-XXXXX within the 50-char column', () => {
    const numero = generarNumeroDocumento('COT');
    expect(numero).toMatch(/^COT-\d{8}-[0-9A-Z]{5}$/);
    expect(numero.length).toBeLessThanOrEqual(50);
  });
});
