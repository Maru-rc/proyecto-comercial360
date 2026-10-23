import { z } from 'zod';

export const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test', 'provision'])
      .default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),

    // Database Connection (Supports both DB_* and DATABASE_* prefixes)
    DB_HOST: z.string().default('localhost'),
    DATABASE_HOST: z.string().optional(),
    DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
    DATABASE_PORT: z.coerce.number().int().min(1).max(65535).optional(),
    DB_NAME: z.string().default('comercial360'),
    DATABASE_NAME: z.string().optional(),
    DB_USER: z.string().default('postgres'),
    DATABASE_USER: z.string().optional(),
    DB_PASSWORD: z.string().default('postgres'),
    DATABASE_PASSWORD: z.string().optional(),
    DB_SSL: z
      .preprocess(
        (val) => val === 'true' || val === true || val === '1',
        z.boolean(),
      )
      .default(false),
    DATABASE_SSL: z
      .preprocess(
        (val) => val === 'true' || val === true || val === '1',
        z.boolean(),
      )
      .optional(),

    // Better Auth Authentication
    BETTER_AUTH_SECRET: z
      .string()
      .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters')
      .default(
        'dev_better_auth_secret_minimum_32_characters_long_comercial360',
      ),
    BETTER_AUTH_URL: z.string().default('http://localhost:3001'),
    FRONTEND_URL: z.string().default('http://localhost:5173'),

    // Amazon S3 / Object Storage (HU-19)
    AWS_REGION: z.string().default('us-east-1'),
    S3_BUCKET: z.string().default('comercial360-evidence'),
    S3_ENDPOINT: z.string().optional(),
    S3_FORCE_PATH_STYLE: z
      .preprocess(
        (val) => val === 'true' || val === true || val === '1',
        z.boolean(),
      )
      .default(false),
    S3_ACCESS_KEY: z.string().optional(),
    S3_SECRET_KEY: z.string().optional(),

    // Geocoding / Routing (HU-11)
    NOMINATIM_USER_AGENT: z.string().default('comercial360'),

    // Seeds & Migrations
    RUN_MIGRATIONS: z
      .preprocess(
        (val) => val === 'true' || val === true || val === '1',
        z.boolean(),
      )
      .default(false),
    RUN_SEED: z
      .preprocess(
        (val) => val === 'true' || val === true || val === '1',
        z.boolean(),
      )
      .default(false),
  })
  .passthrough();

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const errorFormatting = result.error.format();
    console.error('Invalid environment variables:\n', errorFormatting);
    throw new Error(
      `Config validation error: ${JSON.stringify(errorFormatting, null, 2)}`,
    );
  }
  return result.data;
}
