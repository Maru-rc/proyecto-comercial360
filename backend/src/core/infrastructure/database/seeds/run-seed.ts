import AppDataSource from '../data-source-cli.js';

async function runSeeds() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established.\n');

    await seedCatalogos();
    await seedAsesores();

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

async function seedCatalogos() {
  console.log('Inserting base catalogs...');

  await AppDataSource.query(`
    INSERT INTO zona (nombre) VALUES
      ('NORTE'),
      ('SUR'),
      ('CENTRO'),
      ('ORIENTE'),
      ('OCCIDENTE')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Zones inserted.');

  await AppDataSource.query(`
    INSERT INTO tipo_cliente (nombre) VALUES
      ('Industrial'),
      ('Distribuidor'),
      ('Retail'),
      ('Gobierno'),
      ('Corporativo')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Customer types inserted.');

  await AppDataSource.query(`
    INSERT INTO potencial (nombre, orden) VALUES
      ('Alto', 1),
      ('Medio', 2),
      ('Bajo', 3)
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Customer potentials inserted.');

  await AppDataSource.query(`
    INSERT INTO estado_cliente (nombre) VALUES
      ('Activo'),
      ('Inactivo'),
      ('Prospecto'),
      ('Suspendido')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Customer statuses inserted.');

  await AppDataSource.query(`
    INSERT INTO portafolio (nombre, descripcion) VALUES
      ('Maquinaria Industrial', 'Equipos y maquinaria para manufactura'),
      ('Repuestos y Componentes', 'Piezas de repuesto y componentes'),
      ('Servicios Técnicos', 'Mantenimiento y soporte técnico'),
      ('Soluciones Integrales', 'Proyectos llave en mano'),
      ('Consumibles', 'Materiales de consumo industrial')
    ON CONFLICT DO NOTHING;
  `);
  console.log('  Portfolios inserted.');

  await AppDataSource.query(`
    INSERT INTO resultado_visita (nombre) VALUES
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

async function seedAsesores() {
  console.log('\nInserting sample sales representatives...');

  await AppDataSource.query(`
    INSERT INTO asesor (nombre, correo, telefono, estado) VALUES
      ('Juan Pérez García', 'juan.perez@comercial360.com', '3001234567', 'ACTIVO'),
      ('María Rodríguez López', 'maria.rodriguez@comercial360.com', '3109876543', 'ACTIVO'),
      ('Carlos Martínez Soto', 'carlos.martinez@comercial360.com', '3157654321', 'ACTIVO')
    ON CONFLICT (correo) DO NOTHING;
  `);
  console.log('  3 sales representatives inserted.');
}

async function getCounts() {
  const zona = await AppDataSource.query('SELECT COUNT(*) as count FROM zona');
  const tipo = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM tipo_cliente',
  );
  const potencial = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM potencial',
  );
  const estado = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM estado_cliente',
  );
  const portafolio = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM portafolio',
  );
  const resultado = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM resultado_visita',
  );
  const asesor = await AppDataSource.query(
    'SELECT COUNT(*) as count FROM asesor',
  );

  return {
    Zonas: zona[0].count,
    'Tipos Cliente': tipo[0].count,
    Potenciales: potencial[0].count,
    Estados: estado[0].count,
    Portafolios: portafolio[0].count,
    'Resultados Visita': resultado[0].count,
    Asesores: asesor[0].count,
  };
}

void runSeeds();
