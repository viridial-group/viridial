import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Auth Module for Review Service
 * Configures JWT authentication with Passport
 */
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // JWT configuration - validation only (we don't sign tokens here)
        // Secret must match auth-service JWT_ACCESS_SECRET
        secret: configService.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret',
        signOptions: {
          // Not used for validation, but required by JwtModule
          expiresIn: '15m',
        },
      }),
    }),
  ],
  providers: [JwtStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, PassportModule],
})
export class AuthModule {}

