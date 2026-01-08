import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT Strategy for Property Service
 * Validates JWT tokens issued by auth-service
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'dev-access-secret',
      // Optional: Validate issuer/audience if configured
      // issuer: configService.get<string>('JWT_ISSUER'),
      // audience: configService.get<string>('JWT_AUDIENCE'),
    });
  }

  /**
   * Validate JWT payload and return user data
   * This method is called after JWT signature validation
   */
  async validate(payload: any) {
    // Payload from auth-service contains: { sub: userId, email: user.email }
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return user data that will be attached to req.user
    return {
      id: payload.sub,
      email: payload.email,
    };
  }
}

