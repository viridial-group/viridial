import { Injectable, UnauthorizedException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

interface FailedAttempt {
  count: number;
  lastAttempt: number;
}

@Injectable()
export class AuthService {
  private readonly failedAttempts = new Map<string, FailedAttempt>();

  // simple in-memory refresh token store (PoC)
  private readonly refreshTokens = new Set<string>();

  private readonly maxAttempts = 5;
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement dans l'IDE
    private readonly userRepo: any,
  ) {}

  private checkRateLimit(email: string) {
    const now = Date.now();
    const entry = this.failedAttempts.get(email);

    if (!entry) {
      return;
    }

    // reset window if trop ancien
    if (now - entry.lastAttempt > this.windowMs) {
      this.failedAttempts.delete(email);
      return;
    }

    if (entry.count >= this.maxAttempts) {
      throw new HttpException(
        'Too many login attempts, please try again later',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private registerFailedAttempt(email: string) {
    const now = Date.now();
    const entry = this.failedAttempts.get(email);

    if (!entry) {
      this.failedAttempts.set(email, { count: 1, lastAttempt: now });
      return;
    }

    this.failedAttempts.set(email, { count: entry.count + 1, lastAttempt: now });
  }

  private resetFailedAttempts(email: string) {
    this.failedAttempts.delete(email);
  }

  async validateUser(email: string, password: string): Promise<User> {
    this.checkRateLimit(email);

    const user = await this.userRepo.findOne({ where: { email, isActive: true } });
    if (!user) {
      this.registerFailedAttempt(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      this.registerFailedAttempt(email);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.resetFailedAttempts(email);
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    this.refreshTokens.add(refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    if (!this.refreshTokens.has(refreshToken)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      });
    } catch (e) {
      this.refreshTokens.delete(refreshToken);
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.userRepo.findOne({ where: { id: payload.sub, email: payload.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.sub !== user.id || payload.email !== user.email) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newPayload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(newPayload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const newRefreshToken = await this.jwtService.signAsync(newPayload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    // rotate token
    this.refreshTokens.delete(refreshToken);
    this.refreshTokens.add(newRefreshToken);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}


