import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  // 1. Cabeceras de seguridad HTTP
  app.use(helmet());

  // 2. Prefijo global de API
  app.setGlobalPrefix('api');

  // 3. CORS para el Frontend
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // 4. Validación automática de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 5. Swagger en /api/docs
  const config = new DocumentBuilder()
    .setTitle('Comercial 360 API')
    .setDescription('Plataforma de Gestión Comercial — Clean Architecture')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Server running on: http://localhost:${port}/api`);
  console.log(`📄 Swagger documentation: http://localhost:${port}/api/docs`);
}
await bootstrap();
