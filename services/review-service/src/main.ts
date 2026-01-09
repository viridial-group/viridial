import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS pour permettre les requêtes depuis le frontend
  // Production: HTTPS prioritized, Development: HTTP localhost
  const allowedOrigins = [
    // Production HTTPS (prioritized)
    process.env.FRONTEND_URL || 'https://viridial.com',
    'https://viridial.com',
    'https://www.viridial.com',
    'https://148.230.112.148',
    // Development/Testing
    'http://localhost:3000',
    'http://148.230.112.148',
    'http://viridial.com',
    'http://www.viridial.com',
  ].filter(Boolean); // Remove any undefined/null values

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non autorisées
      transform: true, // Transforme automatiquement les types
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3005;
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`Review service is running on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();

