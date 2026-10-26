import { describe, it, expect, beforeEach } from 'vitest';
import { useRouteDraftStore } from './useRouteDraftStore';
import type { ICliente } from '../types/cliente';

// Same check as the backend RouteStop: HH:mm on a 24-hour clock
const HH_MM = /^([01]\d|2[0-3]):[0-5]\d$/;

const cliente = (id: number) => ({ id_cliente: String(id) }) as ICliente;

describe('useRouteDraftStore (HU-08)', () => {
  beforeEach(() => useRouteDraftStore.getState().resetDraft());

  it('suggests one HH:mm time per stop, in visit order', () => {
    const { agregarCliente } = useRouteDraftStore.getState();
    [1, 2, 3].forEach((id) => agregarCliente(cliente(id)));

    const { paradas } = useRouteDraftStore.getState();
    expect(paradas.map((p) => [p.orden, p.hora_sugerida])).toEqual([
      [1, '09:00'],
      [2, '10:00'],
      [3, '11:00'],
    ]);
  });

  it('keeps every suggested time valid for long routes (no AM/PM, no "010:00")', () => {
    const { agregarCliente } = useRouteDraftStore.getState();
    for (let id = 1; id <= 12; id++) agregarCliente(cliente(id));

    const horas = useRouteDraftStore
      .getState()
      .paradas.map((p) => p.hora_sugerida);
    expect(horas.every((hora) => HH_MM.test(hora))).toBe(true);
    expect(horas.at(-1)).toBe('17:00');
  });
});
