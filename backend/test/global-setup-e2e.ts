import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../src/core/infrastructure/database/data-source.js';

// Antes de las pruebas e2e: deja la base de pruebas con el esquema al día
// usando las mismas migraciones que la aplicación.
export default async function setup() {
  process.env.DATABASE_NAME =
    process.env.TEST_DATABASE_NAME ?? 'comercial360_test';
  // Protección: las pruebas borran datos, solo corren en una base *_test
  if (!process.env.DATABASE_NAME.endsWith('_test')) {
    throw new Error(
      'Las pruebas e2e exigen una base cuyo nombre termine en _test',
    );
  }
  const dataSource = new DataSource(buildDataSourceOptions());
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}
