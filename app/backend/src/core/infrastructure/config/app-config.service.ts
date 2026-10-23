import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
  ssl: boolean;
}

export interface AuthConfig {
  secret: string;
  baseURL: string;
  allowedOrigins: string[];
}

export interface StorageConfig {
  region: string;
  bucket: string;
  endpoint?: string;
  forcePathStyle: boolean;
  accessKey?: string;
  secretKey?: string;
}

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV', 'development');
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get port(): number {
    return this.config.get<number>('PORT', 3001);
  }

  get database(): DatabaseConfig {
    const host =
      this.config.get<string>('DATABASE_HOST') ??
      this.config.get<string>('DB_HOST', 'localhost');
    const port =
      this.config.get<number>('DATABASE_PORT') ??
      this.config.get<number>('DB_PORT', 5432);
    const database =
      this.config.get<string>('DATABASE_NAME') ??
      this.config.get<string>('DB_NAME', 'comercial360');
    const username =
      this.config.get<string>('DATABASE_USER') ??
      this.config.get<string>('DB_USER');
    const password =
      this.config.get<string>('DATABASE_PASSWORD') ??
      this.config.get<string>('DB_PASSWORD');
    const rawSsl =
      this.config.get<string | boolean>('DATABASE_SSL') ??
      this.config.get<string | boolean>('DB_SSL', false);
    const ssl = String(rawSsl) === 'true';

    return { host, port, database, username, password, ssl };
  }

  get auth(): AuthConfig {
    const secret = this.config.get<string>('BETTER_AUTH_SECRET', '');
    const baseURL = this.config.get<string>(
      'BETTER_AUTH_URL',
      'http://localhost:3001',
    );
    const frontendUrls = this.config
      .get<string>('FRONTEND_URL', 'http://localhost:5173')
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);

    const backendOrigin = new URL(baseURL).origin;
    const allowedOrigins = [...new Set([...frontendUrls, backendOrigin])];

    return { secret, baseURL, allowedOrigins };
  }

  get storage(): StorageConfig {
    return {
      region: this.config.get<string>('AWS_REGION', 'us-east-1'),
      bucket: this.config.get<string>('S3_BUCKET', 'comercial360-evidence'),
      endpoint: this.config.get<string>('S3_ENDPOINT') || undefined,
      forcePathStyle: this.config.get<boolean>('S3_FORCE_PATH_STYLE', false),
      accessKey: this.config.get<string>('S3_ACCESS_KEY') || undefined,
      secretKey: this.config.get<string>('S3_SECRET_KEY') || undefined,
    };
  }
}
