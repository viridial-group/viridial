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
    // Development/Testing - Localhost variants
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    'http://localhost:3006',
    'http://127.0.0.1',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:3003',
    'http://127.0.0.1:3004',
    'http://127.0.0.1:3005',
    'http://127.0.0.1:3006',
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

  // Set global prefix for API routes
  // Note: Prefix is set per controller, not globally
  // app.setGlobalPrefix('properties'); // Commented - controllers already use /properties prefix

  // Validation globale des DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette les requêtes avec des propriétés non autorisées
      transform: true, // Transforme automatiquement les types
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3003;
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`Property service is running on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
}

bootstrap();

