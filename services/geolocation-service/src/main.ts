import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration CORS
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://viridial.com',
    'http://localhost:3000',
    'https://viridial.com',
    'https://www.viridial.com',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ? Number(process.env.PORT) : 3002;
  await app.listen(port);

  // eslint-disable-next-line no-console
  console.log(`Geolocation service is running on port ${port}`);
  // eslint-disable-next-line no-console
  console.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  // eslint-disable-next-line no-console
  console.log(`Provider: ${process.env.GEOCODING_PROVIDER || 'stub'}`);
}

bootstrap();

