import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';
import { configureApp } from './app.setup.js';
import { AppConfigService } from './core/infrastructure/config/app-config.service.js';

// Environment variables are loaded before initializing the app.
try {
  process.loadEnvFile();
} catch (error: unknown) {
  if (!(
    error instanceof Error &&
    'code' in error &&
    (error as NodeJS.ErrnoException).code === 'ENOENT'
  )) {
    throw error;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // Helmet, /api prefix, CORS, Better Auth and validation (see app.setup.ts)
  configureApp(app);

  // Swagger setup at /api/docs
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

  const appConfig = app.get(AppConfigService);
  const port = appConfig.port;
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}/api`);
  console.log(`📄 Swagger documentation: http://localhost:${port}/api/docs`);
}
await bootstrap();
