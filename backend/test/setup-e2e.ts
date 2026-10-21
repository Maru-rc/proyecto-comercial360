// Variables de entorno para las pruebas e2e (siempre contra una base de pruebas).
process.env.NODE_ENV = 'test';
// Siempre una base de pruebas, aunque el .env apunte a la de desarrollo
process.env.DATABASE_NAME =
  process.env.TEST_DATABASE_NAME ?? 'comercial360_test';
process.env.BETTER_AUTH_SECRET = 'test_secret_test_secret_test_secret_12345';
process.env.BETTER_AUTH_URL = 'http://localhost:3001';
process.env.FRONTEND_URL = 'http://localhost:5173';
