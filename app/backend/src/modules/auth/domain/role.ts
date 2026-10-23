// Roles allowed in Comercial360. These are the same values accepted by the
// CHECK constraint on the user.role column in the database.
export const ROLES = ['ASESOR', 'DIRECTOR'] as const;

export type Role = (typeof ROLES)[number];

export function isRole(value: unknown): value is Role {
  return (
    typeof value === 'string' && (ROLES as readonly string[]).includes(value)
  );
}
