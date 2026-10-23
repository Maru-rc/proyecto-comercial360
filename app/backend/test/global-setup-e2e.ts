import { Client } from 'pg';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../src/core/infrastructure/database/data-source.js';
import {
  applyE2eEnv,
  assertIsTestDatabase,
  TEST_DATABASE_NAME,
} from './e2e-env.js';

async function ensureTestDatabaseExists(): Promise<void> {
  assertIsTestDatabase(TEST_DATABASE_NAME);

  const client = new Client({
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? 5432),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: 'postgres',
    ssl:
      process.env.DATABASE_SSL === 'true'
        ? { rejectUnauthorized: false }
        : false,
  });

  await client.connect();
  try {
    const { rows } = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [TEST_DATABASE_NAME],
    );
    if (rows.length === 0) {
      await client.query(`CREATE DATABASE "${TEST_DATABASE_NAME}"`);
      console.log(`Base de pruebas creada: ${TEST_DATABASE_NAME}`);
    }
  } finally {
    await client.end();
  }
}

export default async function setup() {
  applyE2eEnv();
  assertIsTestDatabase(process.env.DATABASE_NAME ?? '');

  await ensureTestDatabaseExists();

  const dataSource = new DataSource(buildDataSourceOptions());
  await dataSource.initialize();
  await dataSource.runMigrations();
  await dataSource.destroy();
}
