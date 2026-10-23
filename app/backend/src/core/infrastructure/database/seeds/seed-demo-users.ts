import type { DataSource } from 'typeorm';
import type { Auth } from '../../../../modules/auth/infrastructure/better-auth/auth.factory.js';
import type { Role } from '../../../../modules/auth/domain/role.js';

export interface DemoUser {
  name: string;
  email: string;
  password: string;
  role: Role;
  asesor?: { telefono: string };
}

export async function seedDemoUsers(
  auth: Auth,
  dataSource: DataSource,
  users: DemoUser[],
): Promise<void> {
  const ctx = await auth.$context;

  for (const demo of users) {
    const email = demo.email.toLowerCase();

    if (demo.role === 'ASESOR' && demo.asesor) {
      await dataSource.query(
        `INSERT INTO "sales_representatives" ("name", "email", "phone", "status")
         VALUES ($1, $2, $3, 'ACTIVE')
         ON CONFLICT (LOWER("email")) DO NOTHING`,
        [demo.name, email, demo.asesor.telefono],
      );
    }

    const existing = await ctx.internalAdapter.findUserByEmail(email);
    if (existing) {
      if ((existing.user as { role?: string }).role !== demo.role) {
        await ctx.internalAdapter.updateUser(existing.user.id, {
          role: demo.role,
        });
      }
      continue;
    }

    const user = await ctx.internalAdapter.createUser(
      { email, name: demo.name, emailVerified: true, role: demo.role },
      { method: 'admin' },
    );
    await ctx.internalAdapter.linkAccount({
      userId: user.id,
      providerId: 'credential',
      accountId: user.id,
      password: await ctx.password.hash(demo.password),
    });
  }
}
