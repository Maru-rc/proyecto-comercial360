import dataSource from '../data-source.js';
import { USER_ROLES } from '../../../../domain-contracts/auth/index.js';
import { createAuth } from '../../../../modules/auth/infrastructure/better-auth/auth.factory.js';
import { createPgPool } from '../../../../modules/auth/infrastructure/better-auth/pg-pool.js';
import { seedCatalogs } from './seed-catalogs.js';
import { seedDemoUsers } from './seed-demo-users.js';

const MIN_PASSWORD_LENGTH = 12;

/**
 * Production bootstrap: reference catalogs plus the first DIRECTOR.
 * Public sign-up is disabled, so this is how the first user gets in.
 * Idempotent: running it again keeps the existing user and catalogs.
 */
async function run() {
  const email = process.env.BOOTSTRAP_DIRECTOR_EMAIL;
  const password = process.env.BOOTSTRAP_DIRECTOR_PASSWORD;
  const name = process.env.BOOTSTRAP_DIRECTOR_NAME ?? 'Director Regional';

  if (!email || !password) {
    throw new Error(
      'Define BOOTSTRAP_DIRECTOR_EMAIL and BOOTSTRAP_DIRECTOR_PASSWORD',
    );
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `BOOTSTRAP_DIRECTOR_PASSWORD must have at least ${MIN_PASSWORD_LENGTH} characters`,
    );
  }

  await dataSource.initialize();
  const pool = createPgPool();
  try {
    await seedCatalogs(dataSource);
    await seedDemoUsers(createAuth(pool), dataSource, [
      { name, email, password, role: USER_ROLES.DIRECTOR },
    ]);
    console.log(`Bootstrap completed: catalogs and director ${email} ready.`);
  } finally {
    await pool.end();
    await dataSource.destroy();
  }
}

await run();
