import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { resolvePostgresConnection } from './postgres-connection.js';

describe('resolvePostgresConnection', () => {
  it('prefers DATABASE_* and falls back to DB_*', () => {
    expect(
      resolvePostgresConnection({
        DATABASE_HOST: 'rds.example',
        DB_HOST: 'ignored',
        DB_PORT: '6543',
        DB_USER: 'app',
        DB_PASSWORD: 'secret',
        DB_NAME: 'c360',
      }),
    ).toMatchObject({
      host: 'rds.example',
      port: 6543,
      user: 'app',
      password: 'secret',
      database: 'c360',
      ssl: false,
    });
  });

  it('defaults to localhost:5432 without TLS', () => {
    expect(resolvePostgresConnection({})).toMatchObject({
      host: 'localhost',
      port: 5432,
      ssl: false,
    });
  });

  it('encrypts without verifying when no CA is configured', () => {
    expect(resolvePostgresConnection({ DATABASE_SSL: 'true' }).ssl).toEqual({
      rejectUnauthorized: false,
    });
  });

  it('verifies the server certificate with DATABASE_SSL_CA', () => {
    const dir = mkdtempSync(join(tmpdir(), 'c360-ca-'));
    const caPath = join(dir, 'ca.pem');
    writeFileSync(caPath, 'CERT');
    expect(
      resolvePostgresConnection({
        DATABASE_SSL: 'true',
        DATABASE_SSL_CA: caPath,
      }).ssl,
    ).toEqual({ ca: 'CERT', rejectUnauthorized: true });
  });
});
