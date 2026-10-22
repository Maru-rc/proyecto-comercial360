import AppDataSource from '../data-source-cli.js';

async function runSeeds() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established.\n');

    await seedCatalogs();
    await seedSalesRepresentatives();

    console.log('\nSeeds completed successfully.');

    const counts = await getCounts();
    console.log('\nInserted data summary:');
    console.table(counts);
  } catch {
    console.error(
      'Could not load the initial data. Check the database connection and try again.',
    );
    process.exitCode = 1;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

async function seedCatalogs() {
  console.log('Inserting base catalogs...');

  await AppDataSource.query(`
    INSERT INTO zones (name) VALUES
      ('NORTE'),
      ('SUR'),
      ('CENTRO'),
      ('ORIENTE'),
      ('OCCIDENTE')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Zones inserted.');

  await AppDataSource.query(`
    INSERT INTO customer_types (name) VALUES
      ('Industrial'),
      ('Distribuidor'),
      ('Retail'),
      ('Gobierno'),
      ('Corporativo')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Customer types inserted.');

  await AppDataSource.query(`
    INSERT INTO potentials (name, sort_order) VALUES
      ('Alto', 1),
      ('Medio', 2),
      ('Bajo', 3)
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Customer potentials inserted.');

  await AppDataSource.query(`
    INSERT INTO customer_statuses (name) VALUES
      ('Activo'),
      ('Inactivo'),
      ('Prospecto'),
      ('Suspendido')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Customer statuses inserted.');

  await AppDataSource.query(`
    INSERT INTO portfolios (name, description) VALUES
      ('Maquinaria Industrial', 'Equipos y maquinaria para manufactura'),
      ('Repuestos y Componentes', 'Piezas de repuesto y componentes'),
      ('Servicios Técnicos', 'Mantenimiento y soporte técnico'),
      ('Soluciones Integrales', 'Proyectos llave en mano'),
      ('Consumibles', 'Materiales de consumo industrial')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Portfolios inserted.');

  await AppDataSource.query(`
    INSERT INTO visit_outcomes (name) VALUES
      ('Interesado'),
      ('No interesado'),
      ('Cotización generada'),
      ('Pedido cerrado'),
      ('No visitado'),
      ('Requiere seguimiento')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Visit outcomes inserted.');
}

async function seedSalesRepresentatives() {
  console.log('\nInserting sample sales representatives...');

  await AppDataSource.query(`
    INSERT INTO sales_representatives (name, email, phone, status) VALUES
      ('Juan Pérez García', 'juan.perez@comercial360.com', '3001234567', 'ACTIVO'),
      ('María Rodríguez López', 'maria.rodriguez@comercial360.com', '3109876543', 'ACTIVO'),
      ('Carlos Martínez Soto', 'carlos.martinez@comercial360.com', '3157654321', 'ACTIVO')
    ON CONFLICT (email) DO NOTHING;
  `);
  console.log('  3 sales representatives inserted.');
}

async function getCounts() {
  const zones = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM zones',
  );
  const customerTypes = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM customer_types',
  );
  const potentials = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM potentials',
  );
  const customerStatuses = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM customer_statuses',
  );
  const portfolios = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM portfolios',
  );
  const visitOutcomes = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM visit_outcomes',
  );
  const salesRepresentatives = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM sales_representatives',
  );

  return {
    Zones: zones[0].count,
    'Customer Types': customerTypes[0].count,
    Potentials: potentials[0].count,
    'Customer Statuses': customerStatuses[0].count,
    Portfolios: portfolios[0].count,
    'Visit Outcomes': visitOutcomes[0].count,
    'Sales Representatives': salesRepresentatives[0].count,
  };
}

void runSeeds();
