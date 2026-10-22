import { INestApplication, ValidationPipe } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import helmet from 'helmet';
import {
  AUTH,
  allowedOrigins,
} from './modules/auth/infrastructure/better-auth/auth.factory.js';
import type { Auth } from './modules/auth/infrastructure/better-auth/auth.factory.js';

/**
 * Configuración común de la app (la usan main.ts y las pruebas e2e).
 */
export function configureApp(app: INestApplication) {
  // 1. Cabeceras de seguridad HTTP
  app.use(helmet());

  // 2. Prefijo global de API
  app.setGlobalPrefix('api');

  // 3. CORS solo para el frontend autorizado, con cookies de sesión
  app.enableCors({ origin: allowedOrigins(), credentials: true });

  // 4. Better Auth atiende /api/auth/*. Se monta aquí, antes de que Nest
  // active su lector de JSON, porque Better Auth lee el cuerpo por su cuenta.
  const auth = app.get<Auth>(AUTH);
  app
    .getHttpAdapter()
    .getInstance()
    .all('/api/auth/*splat', toNodeHandler(auth));

  // 5. Validación automática de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
