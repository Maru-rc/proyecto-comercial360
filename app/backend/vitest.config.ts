import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`. Requires Vite 8, which ships this option.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    setupFiles: ['reflect-metadata'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      // Same scope as sonar.coverage.exclusions: only the testable core
      // (domain + application). Adapters and presentation wiring are excluded.
      exclude: [
        'src/main.ts',
        '**/*.spec.ts',
        '**/*.e2e-spec.ts',
        '**/*.module.ts',
        '**/data-source*.ts',
        '**/migrations/**',
        '**/seeds/**',
        '**/*.orm-entity.ts',
        '**/*.controller.ts',
        '**/*.dto.ts',
        '**/*.decorator.ts',
        '**/*.guard.ts',
        '**/*.filter.ts',
        '**/infrastructure/**',
      ],
      reporter: ['text-summary', 'lcov'],
      // Set just below the current baseline (stmts 88%, branches 78%,
      // funcs 91%, lines 88%): coverage can grow, never drop.
      thresholds: {
        statements: 85,
        branches: 75,
        functions: 88,
        lines: 85,
      },
    },
  },
});
