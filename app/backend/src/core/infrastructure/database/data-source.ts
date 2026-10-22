import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AsesorOrmEntity } from '../../../modules/auth/infrastructure/persistence/entities/asesor.orm-entity.js';
import { CreateAsesorTable1792500000000 } from './migrations/1792500000000-CreateAsesorTable.js';
import { CreateBetterAuthTables1792500000001 } from './migrations/1792500000001-CreateBetterAuthTables.js';
import { RenameAsesorToSalesRepresentatives1792600000000 } from './migrations/1792600000000-RenameAsesorToSalesRepresentatives.js';
import { InitialSchema1792634405120 } from './migrations/1792634405120-InitialSchema.js';

try {
  process.loadEnvFile();
} catch {}

export function buildDataSourceOptions(
  env: NodeJS.ProcessEnv = process.env,
): DataSourceOptions {
  return {
    type: 'postgres',
    host: env.DATABASE_HOST ?? 'localhost',
    port: Number(env.DATABASE_PORT ?? 5432),
    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [AsesorOrmEntity],
    migrations: [
      CreateAsesorTable1792500000000,
      CreateBetterAuthTables1792500000001,
      RenameAsesorToSalesRepresentatives1792600000000,
      InitialSchema1792634405120,
    ],
    synchronize: false,
    extra: { max: 10 },
  };
}

export default new DataSource(buildDataSourceOptions());
