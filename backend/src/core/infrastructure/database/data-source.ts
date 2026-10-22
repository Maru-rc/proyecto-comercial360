import dotenv from 'dotenv';
import path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { validateEnv } from '../config/env.schema.js';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Validar variables de entorno con Zod antes de configurar la base de datos
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
  entities: [path.join(__dirname, '../../../../**/*.orm-entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/*{.ts,.js}')],
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
