import { describe, it, expect } from 'vitest';
import { RouteAgendaCalculator } from './route-agenda-calculator.js';

describe('RouteAgendaCalculator (Domain Service)', () => {
  it('debe calcular correctamente las fechas semanales dentro del rango', () => {
    // 2026-11-01 es Domingo
    // Lunes son: 2, 9, 16, 23, 30 de Noviembre 2026
    const startDate = new Date(2026, 10, 1); // 1 Nov 2026
    const endDate = new Date(2026, 10, 30); // 30 Nov 2026

    const dates = RouteAgendaCalculator.calculateExecutionDates({
      executionDay: 'Lunes',
      frequency: 'Semanal',
      startDate,
      endDate,
    });

    expect(dates).toHaveLength(5);
    expect(dates[0].getDate()).toBe(2);
    expect(dates[1].getDate()).toBe(9);
    expect(dates[2].getDate()).toBe(16);
    expect(dates[3].getDate()).toBe(23);
    expect(dates[4].getDate()).toBe(30);
  });

  it('debe calcular fechas quincenales cada 14 días', () => {
    const startDate = new Date(2026, 10, 1);
    const endDate = new Date(2026, 10, 30);

    const dates = RouteAgendaCalculator.calculateExecutionDates({
      executionDay: 'Lunes',
      frequency: 'Quincenal',
      startDate,
      endDate,
    });

    expect(dates).toHaveLength(3); // 2, 16, 30
    expect(dates[0].getDate()).toBe(2);
    expect(dates[1].getDate()).toBe(16);
    expect(dates[2].getDate()).toBe(30);
  });

  it('debe generar visitas para cada parada y cada fecha calculada con su hora sugerida', () => {
    const startDate = new Date(2026, 10, 2); // Lunes 2 Nov 2026
    const endDate = new Date(2026, 10, 9); // Lunes 9 Nov 2026 (2 fechas)

    const visits = RouteAgendaCalculator.generateVisits({
      routeId: 1,
      advisorId: 99,
      executionDay: 'Lunes',
      frequency: 'Semanal',
      defaultStartTime: '08:00',
      startDate,
      endDate,
      stops: [
        { customerId: 101, visitOrder: 1, suggestedTime: '08:30' },
        { customerId: 102, visitOrder: 2, suggestedTime: '11:00' },
      ],
    });

    expect(visits).toHaveLength(4); // 2 fechas * 2 paradas
    expect(visits[0].customerId).toBe(101);
    expect(visits[0].salesRepresentativeId).toBe(99);
    expect(visits[0].routeId).toBe(1);
    expect(visits[0].status).toBe('PENDIENTE');
    expect(visits[0].scheduledAt.getHours()).toBe(8);
    expect(visits[0].scheduledAt.getMinutes()).toBe(30);

    expect(visits[1].customerId).toBe(102);
    expect(visits[1].scheduledAt.getHours()).toBe(11);
    expect(visits[1].scheduledAt.getMinutes()).toBe(0);
  });
});
