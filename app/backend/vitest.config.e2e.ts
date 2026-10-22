import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // `setup-e2e` carga el .env y fija la base de pruebas; `global-setup-e2e`
    // crea esa base (si no existe) y aplica las migraciones.
    setupFiles: ['./test/setup-e2e.ts'],
    globalSetup: ['./test/global-setup-e2e.ts'],
    // Las pruebas e2e comparten la misma base: nunca en paralelo.
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 60_000,
  },
});
