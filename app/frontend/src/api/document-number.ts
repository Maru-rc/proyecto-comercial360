/**
 * Builds a unique-enough document number such as `COT-20261025-4F7K2`.
 * The backend rejects duplicates with 409, so a collision only asks for a retry.
 */
export const generarNumeroDocumento = (prefijo: 'COT' | 'PED'): string => {
  const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const sufijo = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `${prefijo}-${hoy}-${sufijo}`;
};
