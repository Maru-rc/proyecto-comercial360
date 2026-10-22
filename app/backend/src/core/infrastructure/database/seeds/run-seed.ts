import dataSource from '../data-source.js';
import { createAuth } from '../../../../modules/auth/infrastructure/better-auth/auth.factory.js';
import { createPgPool } from '../../../../modules/auth/infrastructure/better-auth/pg-pool.js';
import { seedDemoUsers } from './seed-demo-users.js';

// Seed de usuarios de demostración: un asesor y un director.
// Las contraseñas vienen del entorno (.env), nunca del código.
async function run() {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.SEED_ALLOW_PRODUCTION !== 'true'
  ) {
    throw new Error('El seed de demostración no se ejecuta en producción');
  }

  const asesorPassword = process.env.SEED_ASESOR_PASSWORD;
  const directorPassword = process.env.SEED_DIRECTOR_PASSWORD;
  if (!asesorPassword || !directorPassword) {
    throw new Error(
      'Define SEED_ASESOR_PASSWORD y SEED_DIRECTOR_PASSWORD en el .env',
    );
  }

  await dataSource.initialize();
  const pool = createPgPool();
  try {
    await seedDemoUsers(createAuth(pool), dataSource, [
      {
        name: 'Juan Pérez',
        email: process.env.SEED_ASESOR_EMAIL ?? 'juan.perez@comercial360.com',
        password: asesorPassword,
        role: 'ASESOR',
        asesor: { telefono: '3001234567' },
      },
      {
        name: 'Richard López',
        email:
          process.env.SEED_DIRECTOR_EMAIL ?? 'richard.lopez@comercial360.com',
        password: directorPassword,
        role: 'DIRECTOR',
      },
    ]);
    console.log('Seed completado: asesor y director de demostración listos');
  } finally {
    await pool.end();
    await dataSource.destroy();
  }
}

await run();
