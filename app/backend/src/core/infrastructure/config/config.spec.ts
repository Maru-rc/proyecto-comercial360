import { describe, expect, it } from 'vitest';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration } from '../../../config/app.config.js';
import { envValidationSchema } from './env.validation.js';
import { AppConfigService } from './app-config.service.js';

describe('AppConfigService & Environment Validation (Joi)', () => {
  it('should validate default environment values and return valid config', () => {
    const { error, value } = envValidationSchema.validate({});
    expect(error).toBeUndefined();
    expect(value.NODE_ENV).toBe('development');
    expect(value.PORT).toBe(3001);
    expect(value.DB_HOST).toBe('localhost');
    expect(value.DB_PORT).toBe(5432);
    expect(value.DB_NAME).toBe('comercial360');
    expect(value.AWS_REGION).toBe('us-east-1');
  });

  it('should expose typed getters through AppConfigService', () => {
    const rawConfig = {
      NODE_ENV: 'production',
      PORT: 8080,
      DB_HOST: 'aurora.cluster.rds.amazonaws.com',
      DB_PORT: 5432,
      DB_NAME: 'prod_comercial360',
      DB_USER: 'admin',
      DB_PASSWORD: 'supersecretpassword',
      DB_SSL: 'true',
      BETTER_AUTH_SECRET:
        'a_very_secure_secret_that_has_at_least_32_characters_123',
      BETTER_AUTH_URL: 'https://api.comercial360.com',
      FRONTEND_URL: 'https://app.comercial360.com',
      S3_BUCKET: 'prod-evidence-bucket',
      AWS_REGION: 'us-east-1',
    };

    const configService = new ConfigService(rawConfig);
    const appConfig = new AppConfigService(configService);

    expect(appConfig.isProduction).toBe(true);
    expect(appConfig.port).toBe(8080);
    expect(appConfig.database.host).toBe('aurora.cluster.rds.amazonaws.com');
    expect(appConfig.database.ssl).toBe(true);
    expect(appConfig.database.username).toBe('admin');
    expect(appConfig.auth.baseURL).toBe('https://api.comercial360.com');
    expect(appConfig.auth.allowedOrigins).toContain(
      'https://app.comercial360.com',
    );
    expect(appConfig.auth.allowedOrigins).toContain(
      'https://api.comercial360.com',
    );
    expect(appConfig.storage.bucket).toBe('prod-evidence-bucket');
  });

  it('should prefer DATABASE_HOST alias over DB_HOST if both are provided', () => {
    const rawConfig = {
      DB_HOST: 'legacy-host',
      DATABASE_HOST: 'canonical-host',
    };

    const configService = new ConfigService(rawConfig);
    const appConfig = new AppConfigService(configService);

    expect(appConfig.database.host).toBe('canonical-host');
  });

  it('should reject invalid ports in schema validation', () => {
    const { error } = envValidationSchema.validate({
      PORT: 999999, // Exceeds valid port range
    });

    expect(error).toBeDefined();
  });

  it('should load AppConfiguration factory structure with defaults and aliases', () => {
    const config = AppConfiguration();
    expect(config.environment).toBeDefined();
    expect(config.database.port).toBe(5432);
    expect(config.AWS.S3.bucketName).toBeDefined();
    expect(config.betterAuth.expiresIn).toBe('1h');
  });
});
