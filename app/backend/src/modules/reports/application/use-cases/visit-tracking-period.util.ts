import type { TrackingPeriod } from '../ports/visit-tracking.port.js';

const PERIOD_ALIASES: Record<string, TrackingPeriod> = {
  today: 'today',
  week: 'week',
  month: 'month',
  hoy: 'today',
  semana: 'week',
  'esta semana': 'week',
  mes: 'month',
  'este mes': 'month',
};

export function resolveVisitTrackingPeriod(
  value: string | undefined,
): TrackingPeriod {
  if (!value) {
    return 'week';
  }
  const normalized = value.trim().toLowerCase();
  return PERIOD_ALIASES[normalized] ?? 'week';
}
