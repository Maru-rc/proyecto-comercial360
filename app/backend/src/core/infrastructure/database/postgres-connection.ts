import { readFileSync } from 'node:fs';

export interface PostgresConnection {
  host: string;
  port: number;
  user?: string;
  password?: string;
  database?: string;
  ssl: false | { ca?: string; rejectUnauthorized: boolean };
}

/**
 * PostgreSQL settings shared by TypeORM and the Better Auth pool, so both
 * always reach the same database. DATABASE_* wins over the DB_* aliases.
 *
 * TLS: with DATABASE_SSL_CA (e.g. the Amazon RDS bundle) the server
 * certificate is verified. Without it the connection is encrypted but not
 * verified, which keeps local and legacy setups working.
 */
export function resolvePostgresConnection(
  env: NodeJS.ProcessEnv = process.env,
): PostgresConnection {
  return {
    host: env.DATABASE_HOST ?? env.DB_HOST ?? 'localhost',
    port: Number(env.DATABASE_PORT ?? env.DB_PORT ?? 5432),
    user: env.DATABASE_USER ?? env.DATABASE_USERNAME ?? env.DB_USER,
    password: env.DATABASE_PASSWORD ?? env.DB_PASSWORD,
    database: env.DATABASE_NAME ?? env.DB_NAME,
    ssl: resolveSsl(env),
  };
}

function resolveSsl(env: NodeJS.ProcessEnv): PostgresConnection['ssl'] {
  if ((env.DATABASE_SSL ?? env.DB_SSL) !== 'true') {
    return false;
  }
  const caPath = env.DATABASE_SSL_CA;
  if (!caPath) {
    return { rejectUnauthorized: false };
  }
  return { ca: readFileSync(caPath, 'utf8'), rejectUnauthorized: true };
}
