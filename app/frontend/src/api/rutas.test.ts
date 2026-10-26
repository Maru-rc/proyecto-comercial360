import { describe, it, expect } from 'vitest';
import { buildAsesoresSchedule, type IAsesor } from './rutas';
import { generarNumeroDocumento } from './document-number';
import type { IRuta } from '../types/ruta';

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

describe('generarNumeroDocumento', () => {
  it('builds PREFIX-YYYYMMDD-XXXXX within the 50-char column', () => {
    const numero = generarNumeroDocumento('COT');
    expect(numero).toMatch(/^COT-\d{8}-[0-9A-Z]{5}$/);
    expect(numero.length).toBeLessThanOrEqual(50);
  });
});
