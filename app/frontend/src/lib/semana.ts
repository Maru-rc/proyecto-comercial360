/** ISO-8601 week number of a date. */
export const isoWeek = (date: Date): number => {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

const fmt = (d: Date) =>
  d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });

/** "20 oct - 26 oct" for the Monday-to-Sunday week that contains the date. */
export const weekRangeLabel = (date: Date): string => {
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return `${fmt(monday)} - ${fmt(sunday)}`;
};

export interface SemanaOpcion {
  numero: number;
  etiqueta: string;
}

/** The current week and the previous ones, newest first. */
export const semanasRecientes = (
  cantidad: number,
  hoy: Date = new Date(),
): SemanaOpcion[] =>
  Array.from({ length: cantidad }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i * 7);
    return {
      numero: isoWeek(d),
      etiqueta: `S${isoWeek(d)} · ${weekRangeLabel(d)}`,
    };
  });

export const DIAS_SEMANA = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
