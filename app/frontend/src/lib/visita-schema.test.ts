import { describe, expect, it } from 'vitest';
import { visitaSchema } from './visita-schema';

const base = {
  fecha_visita: '2026-10-27',
  hora_inicio: '10:00',
  hora_fin: '12:45',
  semana: 44,
  dia: 'Martes',
  asesor_nombre: 'Director Regional',
  id_cliente: '9',
  cliente_nombre: 'Alcaldia Local Suroccidente',
  estado_visita: 'VISITADO',
  resultado_visita: 'Interesado',
  observaciones: 'El cliente está interesado',
  fecha_proxima_visita: '2026-10-31',
};

describe('visitaSchema', () => {
  it('accepts an empty order amount when no order was generated', () => {
    // An empty <input type="number"> registered with valueAsNumber yields NaN
    const result = visitaSchema.safeParse({
      ...base,
      genero_cotizacion: true,
      numero_cotizacion: 'COT-1',
      valor_cotizacion: 230004,
      genero_pedido: false,
      valor_pedido: Number.NaN,
    });

    expect(result.success).toBe(true);
    expect(result.data?.valor_pedido).toBeUndefined();
  });

  it('asks for number and amount when a quotation was generated', () => {
    const result = visitaSchema.safeParse({
      ...base,
      genero_cotizacion: true,
      valor_cotizacion: Number.NaN,
    });

    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toEqual([
      'Escribe el número de la cotización',
      'Escribe el valor de la cotización',
    ]);
  });

  it('rejects a zero or negative amount', () => {
    const result = visitaSchema.safeParse({
      ...base,
      genero_pedido: true,
      numero_pedido: 'PED-1',
      valor_pedido: 0,
    });

    expect(result.error?.issues[0].message).toBe(
      'El valor debe ser mayor que 0',
    );
  });

  it('explains in Spanish what is missing instead of the default English text', () => {
    const result = visitaSchema.safeParse({
      ...base,
      semana: Number.NaN,
      estado_visita: '',
    });

    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toEqual([
      'Elige una fecha de visita válida',
      'Elige el estado de la visita',
    ]);
  });
});
