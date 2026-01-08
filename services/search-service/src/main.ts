import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS for frontend
  const allowedOrigins = [
    process.env.FRONTEND_URL || 'https://viridial.com',
    'https://viridial.com',
    'https://www.viridial.com',
    'https://148.230.112.148',
    'http://localhost:3000',
    'http://148.230.112.148',
    'http://viridial.com',
    'http://www.viridial.com',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
  });

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = configService.get<number>('PORT') || 3003;
  await app.listen(port);
  console.log(`Search Service is running on: ${await app.getUrl()}`);
}
bootstrap();

