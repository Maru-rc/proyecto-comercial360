import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule, ObserveInstrument } from './app.module.js';
import { configureApp } from './app.setup.js';

try {
  process.loadEnvFile();
} catch {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  configureApp(app);

  const config = new DocumentBuilder()
    .setTitle('Comercial 360 API')
    .setDescription('Plataforma de Gestión Comercial — Clean Architecture')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('better-auth.session_token')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  Object.assign(document.paths, {
    '/api/auth/sign-in/email': {
      post: {
        tags: ['auth'],
        summary: 'Iniciar sesión con correo y contraseña',
        description:
          'Valida las credenciales y establece la cookie de sesión httpOnly de Better Auth. El registro público está deshabilitado.',
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
                    example: 'asesor@comercial360.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    example: 'TuContrasena',
                  },
                  rememberMe: {
                    type: 'boolean',
                    description: 'Si es true, solicita una sesión persistente.',
                    default: false,
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description:
              'Inicio de sesión correcto. Better Auth establece la cookie de sesión.',
          },
          '400': { description: 'Datos de entrada inválidos.' },
          '401': { description: 'Correo o contraseña incorrectos.' },
          '403': {
            description:
              'Solicitud no permitida por la configuración de origen.',
          },
        },
      },
    },
    '/api/auth/get-session': {
      get: {
        tags: ['auth'],
        summary: 'Consultar la sesión actual',
        description:
          'Lee la sesión desde la cookie de Better Auth enviada por el cliente.',
        operationId: 'betterAuthGetSession',
        responses: {
          '200': {
            description:
              'Sesión encontrada. Si no hay sesión activa, Better Auth puede devolver null.',
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
            description:
              'No hay una sesión válida, si aplica según la respuesta de Better Auth.',
          },
        },
      },
    },
    '/api/auth/sign-out': {
      post: {
        tags: ['auth'],
        summary: 'Cerrar sesión',
        description:
          'Invalida la sesión actual y expira la cookie de Better Auth.',
        operationId: 'betterAuthSignOut',
        responses: {
          '200': { description: 'Sesión cerrada correctamente.' },
          '401': {
            description:
              'No hay una sesión válida, si aplica según la respuesta de Better Auth.',
          },
        },
      },
    },
  });

  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}/api`);
  console.log(`📄 Swagger documentation: http://localhost:${port}/api/docs`);
}
await bootstrap();
