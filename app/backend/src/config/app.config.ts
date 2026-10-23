export const AppConfiguration = () => ({
  environment: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3001,
  database: {
    host: process.env.DATABASE_HOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT || process.env.DB_PORT) || 5432,
    username:
      process.env.DATABASE_USERNAME ||
      process.env.DATABASE_USER ||
      process.env.DB_USER ||
      'postgres',
    password:
      process.env.DATABASE_PASSWORD || process.env.DB_PASSWORD || 'password',
    name: process.env.DATABASE_NAME || process.env.DB_NAME || 'comercial360',
    ssl: (process.env.DATABASE_SSL || process.env.DB_SSL) === 'true',
  },
  betterAuth: {
    secret:
      process.env.BETTER_AUTH_SECRET ||
      'dev_better_auth_secret_minimum_32_characters_long_comercial360',
    url: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
    expiresIn: process.env.BETTER_AUTH_EXPIRES_IN || '1h',
  },
  AWS: {
    S3: {
      accessKeyId:
        process.env.AWS_S3_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY,
      bucketName:
        process.env.AWS_S3_BUCKET_NAME ||
        process.env.S3_BUCKET ||
        'comercial360-evidence',
      secretAccessKey:
        process.env.AWS_S3_SECRET_ACCESS_KEY || process.env.S3_SECRET_KEY,
      region:
        process.env.AWS_S3_REGION || process.env.AWS_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    },
  },
});
