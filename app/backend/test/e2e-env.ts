
export const TEST_DATABASE_NAME =
  process.env.TEST_DATABASE_NAME ?? 'comercial360_test';

export function applyE2eEnv(): void {
  try {
    process.loadEnvFile();
  } catch {
  }

  process.env.NODE_ENV = 'test';
  process.env.DATABASE_NAME = TEST_DATABASE_NAME;
  process.env.BETTER_AUTH_SECRET =
    'test_secret_test_secret_test_secret_12345';
  process.env.BETTER_AUTH_URL = 'http://localhost:3001';
  process.env.FRONTEND_URL = 'http://localhost:5173';
}

export function assertIsTestDatabase(name: string): void {
  if (!name.endsWith('_test')) {
    throw new Error(
      `Las pruebas e2e exigen una base cuyo nombre termine en _test (recibido: ${name})`,
    );
  }
}
