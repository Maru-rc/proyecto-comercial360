import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),

  // PostgreSQL / RDS
  DB_HOST: z.string().min(1, 'DB_HOST is required'),
  DB_PORT: z.coerce.number().default(5432),
  DB_NAME: z.string().min(1, 'DB_NAME is required'),
  DB_USER: z.string().min(1, 'DB_USER is required'),
  DB_PASSWORD: z.string().default(''),
  DB_SSL: z
    .string()
    .transform((val) => val === 'true')
    .default(false),

  // BetterAuth
  BETTER_AUTH_SECRET: z.string().min(1, 'BETTER_AUTH_SECRET is required'),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),

  // AWS S3
  AWS_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().default('comercial360-files'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Nominatim
  NOMINATIM_USER_AGENT: z.string().default('comercial360-dev'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:\n', result.error.format());
    throw new Error('Invalid environment configuration');
  }
  return result.data;
}
