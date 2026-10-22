/**
 * Entorno común de las pruebas e2e.
 *
 * Las pruebas e2e SIENPRE corren contra una base propia cuyo nombre termina
 * en `_test`. Nunca contra la base de desarrollo: las pruebas borran datos
 * (usuarios, asesores y sesiones) para partir de un estado conocido.
 */

/** Nombre de la base de pruebas. Nunca puede ser la de desarrollo. */
export const TEST_DATABASE_NAME =
  process.env.TEST_DATABASE_NAME ?? 'comercial360_test';

/**
 * Carga el .env del backend y fija las variables que las pruebas necesitan.
 * `process.loadEnvFile()` no pisa variables ya definidas, por eso primero
 * cargamos el archivo y después forzamos la base de pruebas.
 */
export function applyE2eEnv(): void {
  try {
    process.loadEnvFile();
  } catch {
    // Sin .env: se usan las variables del entorno.
  }

  process.env.NODE_ENV = 'test';
  process.env.DATABASE_NAME = TEST_DATABASE_NAME;
  process.env.BETTER_AUTH_SECRET =
    'test_secret_test_secret_test_secret_12345';
  process.env.BETTER_AUTH_URL = 'http://localhost:3001';
  process.env.FRONTEND_URL = 'http://localhost:5173';
}

/** Corta de seguridad: las pruebas e2e solo pueden tocar bases de prueba. */
export function assertIsTestDatabase(name: string): void {
  if (!name.endsWith('_test')) {
    throw new Error(
      `Las pruebas e2e exigen una base cuyo nombre termine en _test (recibido: ${name})`,
    );
  }
}
