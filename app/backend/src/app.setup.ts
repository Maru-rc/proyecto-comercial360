import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { toNodeHandler } from 'better-auth/node';
import helmet from 'helmet';
import { CorrelationIdMiddleware } from './core/infrastructure/correlation/correlation-id.middleware.js';
import { DomainExceptionFilter } from './core/infrastructure/filters/domain-exception.filter.js';
import { TransformInterceptor } from './core/infrastructure/interceptors/transform.interceptor.js';
import {
  AUTH,
  allowedOrigins,
} from './modules/auth/infrastructure/better-auth/auth.factory.js';
import type { Auth } from './modules/auth/infrastructure/better-auth/auth.factory.js';

/**
 * Common application configuration (used by main.ts and e2e test suite).
 */
export function configureApp(app: INestApplication) {
  // 1. Distributed traceability with Correlation ID in headers and AsyncLocalStorage
  const correlationMiddleware = new CorrelationIdMiddleware();
  app.use(correlationMiddleware.use.bind(correlationMiddleware));

  // 2. HTTP Security headers
  app.use(helmet());

  // 3. Global API prefix
  app.setGlobalPrefix('api');

  // 4. CORS restricted to authorized frontend origins, enabling session cookies
  app.enableCors({ origin: allowedOrigins(), credentials: true });

  // 5. Better Auth routes mounted under /api/auth/*
  const auth = app.get<Auth>(AUTH);
  app
    .getHttpAdapter()
    .getInstance()
    .all('/api/auth/*splat', toNodeHandler(auth));

  // 6. Automatic DTO validation with class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 7. Standardization of HTTP responses into { data, meta }
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new TransformInterceptor(reflector));

  // 8. Global exception filter mapping DomainExceptions to HTTP responses
  app.useGlobalFilters(new DomainExceptionFilter());
}
