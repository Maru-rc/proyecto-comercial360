import Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  PORT: Joi.number().port().default(3001),

  // Database Connection (Supports both DB_* and DATABASE_* prefixes)
  DB_HOST: Joi.string().default('localhost'),
  DATABASE_HOST: Joi.string().optional(),
  DB_PORT: Joi.number().port().default(5432),
  DATABASE_PORT: Joi.number().port().optional(),
  DB_NAME: Joi.string().default('comercial360'),
  DATABASE_NAME: Joi.string().optional(),
  DB_USER: Joi.string().allow('').optional().default('postgres'),
  DATABASE_USER: Joi.string().allow('').optional(),
  DB_PASSWORD: Joi.string().allow('').optional().default('postgres'),
  DATABASE_PASSWORD: Joi.string().allow('').optional(),
  DB_SSL: Joi.boolean().truthy('true', '1').falsy('false', '0').default(false),
  DATABASE_SSL: Joi.boolean()
    .truthy('true', '1')
    .falsy('false', '0')
    .optional(),

  // Better Auth Authentication
  BETTER_AUTH_SECRET: Joi.string()
    .min(32)
    .default('dev_better_auth_secret_minimum_32_characters_long_comercial360'),
  BETTER_AUTH_URL: Joi.string().uri().default('http://localhost:3001'),
  FRONTEND_URL: Joi.string().default('http://localhost:5173'),

  // Amazon S3 / Object Storage (HU-19)
  AWS_REGION: Joi.string().default('us-east-1'),
  S3_BUCKET: Joi.string().allow('').optional().default('comercial360-evidence'),
  S3_ENDPOINT: Joi.string().allow('').optional(),
  S3_FORCE_PATH_STYLE: Joi.boolean()
    .truthy('true', '1')
    .falsy('false', '0')
    .default(false),
  S3_ACCESS_KEY: Joi.string().allow('').optional(),
  S3_SECRET_KEY: Joi.string().allow('').optional(),

  // Geocoding / Routing (HU-11)
  NOMINATIM_USER_AGENT: Joi.string().default('comercial360'),

  // Seeds & Migrations
  RUN_MIGRATIONS: Joi.boolean().truthy('true').falsy('false').default(false),
  RUN_SEED: Joi.boolean().truthy('true').falsy('false').default(false),
}).options({
  allowUnknown: true,
  abortEarly: false,
});
