import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    TypeOrmModule.forRootAsync({
      useFactory: () => parseDatabaseUrl(process.env.DATABASE_URL),
    }),
    TypeOrmModule.forFeature([User, PasswordResetToken, EmailVerificationToken]),
    PassportModule,
    JwtModule.register({}), // secrets & expiresIn gérés dans AuthService via options
  ],
  controllers: [AuthController],
  providers: [AuthService, OidcService, GoogleStrategy, EmailService],
})
export class AppModule {}

