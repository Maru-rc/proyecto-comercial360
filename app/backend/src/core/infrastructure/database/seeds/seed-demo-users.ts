import type { DataSource } from 'typeorm';
import type { Auth } from '../../../../modules/auth/infrastructure/better-auth/auth.factory.js';
import type { Role } from '../../../../modules/auth/domain/role.js';

export interface DemoUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  /** Solo para ASESOR: datos del registro en la tabla ASESOR */
  asesor?: { telefono: string };
}

/**
 * Crea (o corrige) los usuarios de demostración. Se puede ejecutar varias
 * veces sin duplicar nada.
 *
 * Better Auth tiene el registro público desactivado, así que usamos su
 * adaptador interno y su hasher oficial (scrypt). Así la contraseña queda en el
 * formato que Better Auth espera y el login funciona a la primera.
 */
export async function seedDemoUsers(
  auth: Auth,
  dataSource: DataSource,
  users: DemoUser[],
): Promise<void> {
  const ctx = await auth.$context;

  for (const demo of users) {
    const email = demo.email.toLowerCase();

    // 1. Registro en ASESOR (solo para el rol ASESOR)
    if (demo.role === 'ASESOR' && demo.asesor) {
      await dataSource.query(
        `INSERT INTO "asesor" ("nombre", "correo", "telefono", "estado")
         VALUES ($1, $2, $3, 'ACTIVO')
         ON CONFLICT (LOWER("correo")) DO NOTHING`,
        [demo.name, email, demo.asesor.telefono],
      );
    }

    // 2. Usuario de Better Auth
    const existing = await ctx.internalAdapter.findUserByEmail(email);
    if (existing) {
      // Si ya existe, solo nos aseguramos de que el rol sea el correcto
      if ((existing.user as { role?: string }).role !== demo.role) {
        await ctx.internalAdapter.updateUser(existing.user.id, {
          role: demo.role,
        });
      }
      continue;
    }

    const user = await ctx.internalAdapter.createUser(
      { email, name: demo.name, emailVerified: true, role: demo.role },
      { method: 'admin' }, // origen del alta: lo crea el sistema, no un registro público
    );
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: 'credential',
      // Para el login con correo, Better Auth exige accountId = id del usuario
      accountId: user.id,
      password: await ctx.password.hash(demo.password),
    });
  }
}
