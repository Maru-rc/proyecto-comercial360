// Must stay first: ESM evaluates imports in order, and modules below read process.env.
import './load-env.js';
import { Logger, type INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  AppModule,
  ObserveInstrument,
  isObserveEnabled,
} from './app.module.js';
import { configureApp } from './app.setup.js';
import { AppConfigService } from './core/infrastructure/config/app-config.service.js';

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    isObserveEnabled ? { instrument: ObserveInstrument } : {},
  );

  // Helmet, /api prefix, CORS, Better Auth and validation (see app.setup.ts)
  configureApp(app);

  // Behind a reverse proxy (TLS ends there): trust X-Forwarded-* headers
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  const swaggerEnabled = isSwaggerEnabled(process.env);
  if (swaggerEnabled) {
    setupSwagger(app);
  }

  const appConfig = app.get(AppConfigService);
  const port = appConfig.port;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`Server listening on port ${port} (/api)`);
  if (swaggerEnabled) {
    logger.log('Swagger documentation available at /api/docs');
  }
}

/** Swagger is public documentation: on in development, opt-in in production. */
function isSwaggerEnabled(env: NodeJS.ProcessEnv): boolean {
  return env.NODE_ENV !== 'production' || env.SWAGGER_ENABLED === 'true';
}

function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Comercial 360 API')
    .setDescription('Commercial Management Platform — Clean Architecture')
    .setVersion('1.0')
    .addBearerAuth()
    // Better Auth session (httpOnly cookie)
    .addCookieAuth('better-auth.session_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Better Auth endpoints are mounted directly in Express, so Nest Swagger
  // does not discover them automatically. We document them here explicitly.
  Object.assign(document.paths, {
    '/api/auth/sign-in/email': {
      post: {
        tags: ['auth'],
        summary: 'Sign in with email and password',
        description:
          'Validates credentials and establishes Better Auth httpOnly session cookie. Public self-registration is disabled.',
        operationId: 'betterAuthSignInEmail',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    example: 'advisor@comercial360.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'YourPassword123!',
                  },
                  rememberMe: {
                    type: 'boolean',
                    description:
                      'If true, requests a persistent 30-day session.',
                    default: false,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Sign in successful. Better Auth sets session cookie.',
          },
          '400': { description: 'Invalid input payload.' },
          '401': { description: 'Incorrect email or password.' },
          '403': {
            description: 'Request forbidden by origin policy.',
          },
        },
      },
    },
    '/api/auth/get-session': {
      get: {
        tags: ['auth'],
        summary: 'Query current session',
        description: 'Reads session from Better Auth cookie sent by client.',
        operationId: 'betterAuthGetSession',
        responses: {
          '200': {
            description:
              'Active session found. Returns null if unauthenticated.',
            content: {
              'application/json': {
                schema: {
                  oneOf: [
                    {
                      type: 'object',
                      properties: {
                        user: { type: 'object', additionalProperties: true },
                        session: { type: 'object', additionalProperties: true },
                      },
                      required: ['user', 'session'],
                    },
                    { type: 'object', nullable: true },
                  ],
                },
              },
            },
          },
          '401': {
            description: 'No valid session found.',
          },
        },
      },
    },
    '/api/auth/sign-out': {
      post: {
        tags: ['auth'],
        summary: 'Sign out',
        description:
          'Invalidates current session and expires Better Auth session cookie.',
        operationId: 'betterAuthSignOut',
        responses: {
          '200': { description: 'Session closed successfully.' },
          '401': {
            description: 'No active session found.',
          },
        },
      },
    },
  });

  SwaggerModule.setup('api/docs', app, document);
}
await bootstrap();
