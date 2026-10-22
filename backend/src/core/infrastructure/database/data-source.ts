import dotenv from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { validateEnv } from '../config/env.schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(process.cwd(), '.env') });

const env = validateEnv();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  ssl: env.DB_SSL ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: env.NODE_ENV === 'development',
  entities: [
    join(
      __dirname,
      '../../../modules/**/infrastructure/persistence/entities/*.orm-entity.{ts,js}',
    ),
  ],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
