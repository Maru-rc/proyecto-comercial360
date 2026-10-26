/**
 * Common environment configuration for e2e tests.
 *
 * e2e tests ALWAYS run against an isolated test database ending with `_test`.
 * Never against the development database: tests purge tables (users, sales representatives, sessions).
 */

/** Test database name. Must never be the development database. */
export const TEST_DATABASE_NAME =
  process.env.TEST_DATABASE_NAME ?? 'comercial360_test';

/**
 * Loads the backend .env file and sets variables required for e2e tests.
 */
export function applyE2eEnv(): void {
  try {
    process.loadEnvFile();
  } catch (error: unknown) {
    if (
      !(
        error instanceof Error &&
        'code' in error &&
        (error as NodeJS.ErrnoException).code === 'ENOENT'
      )
    ) {
      throw error;
    }
  }

  process.env.NODE_ENV = 'test';
  process.env.DATABASE_NAME = TEST_DATABASE_NAME;
  process.env.BETTER_AUTH_SECRET =
    'test_secret_test_secret_test_secret_12345';
  process.env.BETTER_AUTH_URL = 'http://localhost:3001';
  process.env.FRONTEND_URL = 'http://localhost:5173';
  // Presigned S3 URLs are signed locally, but the AWS SDK still needs
  // credentials to sign them: without these the storage tests get a 500 in CI.
  process.env.AWS_ACCESS_KEY_ID ??= 'test';
  process.env.AWS_SECRET_ACCESS_KEY ??= 'test';
}

/** Safety check: e2e tests must only connect to test databases. */
export function assertIsTestDatabase(name: string): void {
  if (!name.endsWith('_test')) {
    throw new Error(
      `e2e tests require a database name ending with _test (received: ${name})`,
    );
  }
}
