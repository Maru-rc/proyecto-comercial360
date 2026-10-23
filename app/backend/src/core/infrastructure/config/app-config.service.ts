import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export const CONFIG_KEYS = {
  NODE_ENV: 'NODE_ENV',
  PORT: 'PORT',
  DB_HOST: 'DB_HOST',
  DATABASE_HOST: 'DATABASE_HOST',
  DB_PORT: 'DB_PORT',
  DATABASE_PORT: 'DATABASE_PORT',
  DB_NAME: 'DB_NAME',
  DATABASE_NAME: 'DATABASE_NAME',
  DB_USER: 'DB_USER',
  DATABASE_USER: 'DATABASE_USER',
  DB_PASSWORD: 'DB_PASSWORD',
  DATABASE_PASSWORD: 'DATABASE_PASSWORD',
  DB_SSL: 'DB_SSL',
  DATABASE_SSL: 'DATABASE_SSL',
  BETTER_AUTH_SECRET: 'BETTER_AUTH_SECRET',
  BETTER_AUTH_URL: 'BETTER_AUTH_URL',
  FRONTEND_URL: 'FRONTEND_URL',
  AWS_REGION: 'AWS_REGION',
  AWS_S3_REGION: 'AWS_S3_REGION',
  S3_BUCKET: 'S3_BUCKET',
  AWS_S3_BUCKET_NAME: 'AWS_S3_BUCKET_NAME',
  S3_ENDPOINT: 'S3_ENDPOINT',
  S3_FORCE_PATH_STYLE: 'S3_FORCE_PATH_STYLE',
  S3_ACCESS_KEY: 'S3_ACCESS_KEY',
  AWS_S3_ACCESS_KEY_ID: 'AWS_S3_ACCESS_KEY_ID',
  S3_SECRET_KEY: 'S3_SECRET_KEY',
  AWS_S3_SECRET_ACCESS_KEY: 'AWS_S3_SECRET_ACCESS_KEY',
} as const;

export const NODE_ENVIRONMENTS = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
  PROVISION: 'provision',
} as const;

export const CONFIG_DEFAULTS = {
  NODE_ENV: NODE_ENVIRONMENTS.DEVELOPMENT,
  PORT: 3001,
  POSTGRES_PORT: 5432,
  DB_HOST: 'localhost',
  DB_NAME: 'comercial360',
  DB_USER: 'postgres',
  DB_PASSWORD: 'postgres',
  BETTER_AUTH_SECRET: '',
  BETTER_AUTH_URL: 'http://localhost:3001',
  FRONTEND_URL: 'http://localhost:5173',
  AWS_REGION: 'us-east-1',
  S3_BUCKET: 'comercial360-evidence',
} as const;

export interface DatabaseConfig {
  readonly host: string;
  readonly port: number;
  readonly database: string;
  readonly username?: string;
  readonly password?: string;
  readonly ssl: boolean;
}

export interface AuthConfig {
  readonly secret: string;
  readonly baseURL: string;
  readonly allowedOrigins: readonly string[];
}

export interface StorageConfig {
  readonly region: string;
  readonly bucket: string;
  readonly endpoint?: string;
  readonly forcePathStyle: boolean;
  readonly accessKey?: string;
  readonly secretKey?: string;
}

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>(
      CONFIG_KEYS.NODE_ENV,
      CONFIG_DEFAULTS.NODE_ENV,
    );
  }

  get isProduction(): boolean {
    return this.nodeEnv === NODE_ENVIRONMENTS.PRODUCTION;
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === NODE_ENVIRONMENTS.DEVELOPMENT;
  }

  get isTest(): boolean {
    return this.nodeEnv === NODE_ENVIRONMENTS.TEST;
  }

  get port(): number {
    return this.config.get<number>(CONFIG_KEYS.PORT, CONFIG_DEFAULTS.PORT);
  }

  get database(): DatabaseConfig {
    const host =
      this.config.get<string>(CONFIG_KEYS.DATABASE_HOST) ??
      this.config.get<string>(CONFIG_KEYS.DB_HOST, CONFIG_DEFAULTS.DB_HOST);
    const port =
      this.config.get<number>(CONFIG_KEYS.DATABASE_PORT) ??
      this.config.get<number>(
        CONFIG_KEYS.DB_PORT,
        CONFIG_DEFAULTS.POSTGRES_PORT,
      );
    const database =
      this.config.get<string>(CONFIG_KEYS.DATABASE_NAME) ??
      this.config.get<string>(CONFIG_KEYS.DB_NAME, CONFIG_DEFAULTS.DB_NAME);
    const username =
      this.config.get<string>(CONFIG_KEYS.DATABASE_USER) ??
      this.config.get<string>(CONFIG_KEYS.DB_USER, CONFIG_DEFAULTS.DB_USER);
    const password =
      this.config.get<string>(CONFIG_KEYS.DATABASE_PASSWORD) ??
      this.config.get<string>(
        CONFIG_KEYS.DB_PASSWORD,
        CONFIG_DEFAULTS.DB_PASSWORD,
      );
    const rawSsl =
      this.config.get<string | boolean>(CONFIG_KEYS.DATABASE_SSL) ??
      this.config.get<string | boolean>(CONFIG_KEYS.DB_SSL, false);
    const ssl = String(rawSsl) === 'true';

    return { host, port, database, username, password, ssl };
  }

  get auth(): AuthConfig {
    const secret = this.config.get<string>(
      CONFIG_KEYS.BETTER_AUTH_SECRET,
      CONFIG_DEFAULTS.BETTER_AUTH_SECRET,
    );
    const baseURL = this.config.get<string>(
      CONFIG_KEYS.BETTER_AUTH_URL,
      CONFIG_DEFAULTS.BETTER_AUTH_URL,
    );
    const frontendUrls = this.config
      .get<string>(CONFIG_KEYS.FRONTEND_URL, CONFIG_DEFAULTS.FRONTEND_URL)
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    const backendOrigin = new URL(baseURL).origin;
    const allowedOrigins = [
      ...new Set([...frontendUrls, backendOrigin]),
    ] as const;

    return { secret, baseURL, allowedOrigins };
  }

  get storage(): StorageConfig {
    const region =
      this.config.get<string>(CONFIG_KEYS.AWS_S3_REGION) ??
      this.config.get<string>(
        CONFIG_KEYS.AWS_REGION,
        CONFIG_DEFAULTS.AWS_REGION,
      );
    const bucket =
      this.config.get<string>(CONFIG_KEYS.AWS_S3_BUCKET_NAME) ??
      this.config.get<string>(CONFIG_KEYS.S3_BUCKET, CONFIG_DEFAULTS.S3_BUCKET);
    const endpoint =
      this.config.get<string>(CONFIG_KEYS.S3_ENDPOINT) || undefined;
    const forcePathStyle = Boolean(
      this.config.get<boolean>(CONFIG_KEYS.S3_FORCE_PATH_STYLE, false),
    );
    const accessKey =
      (this.config.get<string>(CONFIG_KEYS.AWS_S3_ACCESS_KEY_ID) ??
        this.config.get<string>(CONFIG_KEYS.S3_ACCESS_KEY)) ||
      undefined;
    const secretKey =
      (this.config.get<string>(CONFIG_KEYS.AWS_S3_SECRET_ACCESS_KEY) ??
        this.config.get<string>(CONFIG_KEYS.S3_SECRET_KEY)) ||
      undefined;

    return {
      region,
      bucket,
      endpoint,
      forcePathStyle,
      accessKey,
      secretKey,
    };
  }
}
