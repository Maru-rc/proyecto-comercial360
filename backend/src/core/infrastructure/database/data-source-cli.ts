import dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(process.cwd(), '.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'comercial360_dev',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [
    join(
      __dirname,
      '../../../modules/**/infrastructure/persistence/entities/*.orm-entity.{ts,js}',
    ),
  ],
  migrations: [join(__dirname, 'migrations/*{.ts,.js}')],
});

export default AppDataSource;
