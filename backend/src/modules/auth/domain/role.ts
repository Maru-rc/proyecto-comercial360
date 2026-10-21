// Roles permitidos en Comercial360. Son los mismos valores que acepta la
// restricción CHECK de la columna user.role en la base de datos.
export const ROLES = ['ASESOR', 'DIRECTOR'] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return (
    typeof value === 'string' && (ROLES as readonly string[]).includes(value)
  );
}
