/**
 * YYYY-MM-DD of a date in the user's time zone. toISOString() gives the UTC
 * date, which in Colombia (UTC-5) is already tomorrow from 7 p.m.
 */
export const toLocalIsoDate = (date: Date = new Date()): string => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

/** HH:mm of a date in the user's time zone, as an <input type="time"> takes it. */
export const toLocalTime = (date: Date = new Date()): string =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
