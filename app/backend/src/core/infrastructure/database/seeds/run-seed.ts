import dataSource from '../data-source.js';
import { USER_ROLES } from '../../../../domain-contracts/auth/index.js';
import { createAuth } from '../../../../modules/auth/infrastructure/better-auth/auth.factory.js';
import { createPgPool } from '../../../../modules/auth/infrastructure/better-auth/pg-pool.js';
import { seedCatalogs } from './seed-catalogs.js';
import { seedDemoUsers } from './seed-demo-users.js';

async function run() {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.SEED_ALLOW_PRODUCTION !== 'true'
  ) {
    throw new Error('Demo seed cannot run in production environment');
  }

  const advisorPassword = process.env.SEED_ADVISOR_PASSWORD;
  const directorPassword = process.env.SEED_DIRECTOR_PASSWORD;
  if (!advisorPassword || !directorPassword) {
    throw new Error(
      'Define SEED_ADVISOR_PASSWORD and SEED_DIRECTOR_PASSWORD in the .env',
    );
  }

  await dataSource.initialize();
  const pool = createPgPool();
  try {
    await seedCatalogs(dataSource);
    await seedSalesRepresentatives(dataSource);
    await seedDemoUsers(createAuth(pool), dataSource, [
      {
        name: 'Juan Pérez',
        email: process.env.SEED_ADVISOR_EMAIL ?? 'juan.perez@comercial360.com',
        password: advisorPassword,
        role: USER_ROLES.ADVISOR,
        advisor: { phone: '3001234567' },
      },
      {
        name: 'Richard López',
        email:
          process.env.SEED_DIRECTOR_EMAIL ?? 'richard.lopez@comercial360.com',
        password: directorPassword,
        role: USER_ROLES.DIRECTOR,
      },
    ]);
    console.log('Seed completed: catalogs and demo users are ready.');
  } finally {
    await pool.end();
    await dataSource.destroy();
  }
}

async function seedSalesRepresentatives(
  source: typeof dataSource,
): Promise<void> {
  await source.query(`
    INSERT INTO "sales_representatives" ("name", "email", "phone", "status") VALUES
      ('Juan Pérez García', 'juan.perez@comercial360.com', '3001234567', 'ACTIVE'),
      ('María Rodríguez López', 'maria.rodriguez@comercial360.com', '3109876543', 'ACTIVE'),
      ('Carlos Martínez Soto', 'carlos.martinez@comercial360.com', '3157654321', 'ACTIVE')
    ON CONFLICT DO NOTHING
  `);
}

await run();
