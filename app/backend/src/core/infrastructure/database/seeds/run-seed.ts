import dataSource from '../data-source.js';
import { createAuth } from '../../../../modules/auth/infrastructure/better-auth/auth.factory.js';
import { createPgPool } from '../../../../modules/auth/infrastructure/better-auth/pg-pool.js';
import { seedDemoUsers } from './seed-demo-users.js';

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
    await seedCatalogs(dataSource);
    await seedSalesRepresentatives(dataSource);
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
    console.log('Seed completed: catalogs and demo users are ready.');
  } finally {
    await pool.end();
    await dataSource.destroy();
  }
}

async function seedCatalogs(source: typeof dataSource): Promise<void> {
  await source.query(`
    INSERT INTO zones (name) VALUES
      ('NORTE'), ('SUR'), ('CENTRO'), ('ORIENTE'), ('OCCIDENTE')
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO customer_types (name) VALUES
      ('Industrial'), ('Distribuidor'), ('Retail'), ('Gobierno'), ('Corporativo')
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO potentials (name, sort_order) VALUES
      ('Alto', 1), ('Medio', 2), ('Bajo', 3)
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO customer_statuses (name) VALUES
      ('Activo'), ('Inactivo'), ('Prospecto'), ('Suspendido')
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO portfolios (name, description) VALUES
      ('Maquinaria Industrial', 'Equipos y maquinaria para manufactura'),
      ('Repuestos y Componentes', 'Piezas de repuesto y componentes'),
      ('Servicios Técnicos', 'Mantenimiento y soporte técnico'),
      ('Soluciones Integrales', 'Proyectos llave en mano'),
      ('Consumibles', 'Materiales de consumo industrial')
    ON CONFLICT DO NOTHING
  `);
  await source.query(`
    INSERT INTO visit_outcomes (name) VALUES
      ('Interesado'), ('No interesado'), ('Cotización generada'),
      ('Pedido cerrado'), ('No visitado'), ('Requiere seguimiento')
    ON CONFLICT DO NOTHING
  `);
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
