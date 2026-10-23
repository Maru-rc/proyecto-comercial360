import { INestApplication, ValidationPipe } from '@nestjs/common';
import { toNodeHandler } from 'better-auth/node';
import helmet from 'helmet';
import {
  AUTH,
  allowedOrigins,
} from './modules/auth/infrastructure/better-auth/auth.factory.js';
import type { Auth } from './modules/auth/infrastructure/better-auth/auth.factory.js';

export function configureApp(app: INestApplication) {
  app.use(helmet());

  app.setGlobalPrefix('api');

  app.enableCors({ origin: allowedOrigins(), credentials: true });

  const auth = app.get<Auth>(AUTH);
  app
    .getHttpAdapter()
    .getInstance()
    .all('/api/auth/*splat', toNodeHandler(auth));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
