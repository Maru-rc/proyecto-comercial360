import { Pool } from 'pg';

/**
 * pg Pool for Better Auth. Uses the same database and environment variables
 * as TypeORM so both share the same PostgreSQL instance.
 */
export function createPgPool(env: NodeJS.ProcessEnv = process.env): Pool {
  return new Pool({
    host: env.DATABASE_HOST ?? 'localhost',
    port: Number(env.DATABASE_PORT ?? 5432),
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    ssl: env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: 10,
  });
}
