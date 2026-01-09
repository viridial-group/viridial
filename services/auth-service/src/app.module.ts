import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OidcService } from './services/oidc.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { User } from './entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailVerificationToken } from './entities/email-verification-token.entity';
import { EmailService } from './services/email.service';

// Helper pour parser DATABASE_URL
function parseDatabaseUrl(url?: string) {
  if (!url) {
    throw new Error('DATABASE_URL is required');
  }

  try {
    const parsed = new URL(url);
    return {
      type: 'postgres' as const,
      host: parsed.hostname,
      port: parseInt(parsed.port, 10) || 5432,
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1), // remove leading '/'
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // OK pour dev; à désactiver en prod avec migrations
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL: ${error}`);
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '.env.local'), // .env.local pour développement local
        join(__dirname, '..', '.env'), // .env dans le répertoire du service
        join(__dirname, '..', '..', '..', '.env'), // .env à la racine du projet
        join(__dirname, '..', '..', '..', 'infrastructure', 'docker-compose', '.env'), // .env docker-compose
      ],
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL') || process.env.DATABASE_URL;
        return parseDatabaseUrl(databaseUrl);
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, PasswordResetToken, EmailVerificationToken]),
    PassportModule,
    JwtModule.register({}), // secrets & expiresIn gérés dans AuthService via options
  ],
  controllers: [AuthController],
  providers: [AuthService, OidcService, GoogleStrategy, EmailService],
})
export class AppModule {}

