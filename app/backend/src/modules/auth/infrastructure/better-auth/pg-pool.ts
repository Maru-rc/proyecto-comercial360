import { Pool } from 'pg';
import { resolvePostgresConnection } from '../../../../domain-contracts/index.js';

/** Better Auth's pool: same database and TLS settings as TypeORM. */
export function createPgPool(env: NodeJS.ProcessEnv = process.env): Pool {
  const connection = resolvePostgresConnection(env);
  return new Pool({
    host: connection.host,
    port: connection.port,
    user: connection.user,
    password: connection.password,
    database: connection.database,
    ssl: connection.ssl,
    max: 10,
  });
}
