import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { AsesorOrmEntity } from '../../../modules/auth/infrastructure/persistence/entities/asesor.orm-entity.js';
import { CreateAsesorTable1792500000000 } from './migrations/1792500000000-CreateAsesorTable.js';
import { CreateBetterAuthTables1792500000001 } from './migrations/1792500000001-CreateBetterAuthTables.js';
import { InitialSchema1792634405120 } from './migrations/1792634405120-InitialSchema.js';

// Si existe un archivo .env lo cargamos (útil para la CLI de TypeORM y el seed).
// No pisa variables que ya estén definidas en el entorno.
try {
  process.loadEnvFile();
} catch {
  // Sin .env: se usan las variables del entorno.
}

/** Opciones de conexión compartidas por la app y por la CLI de TypeORM. */
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
    // Las instancias de RDS exigen SSL
    ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    entities: [AsesorOrmEntity],
    migrations: [
      CreateAsesorTable1792500000000,
      CreateBetterAuthTables1792500000001,
      InitialSchema1792634405120,
    ],
    // El esquema solo cambia con migraciones, nunca con synchronize.
    synchronize: false,
    extra: { max: 10 },
  };
}

// La CLI de TypeORM (migration:run, etc.) busca este export.
export default new DataSource(buildDataSourceOptions());
