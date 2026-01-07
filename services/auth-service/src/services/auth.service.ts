import { Injectable, UnauthorizedException, HttpException, HttpStatus, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { User } from '../entities/user.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { EmailService } from './email.service';

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
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: any,
    private readonly emailService: EmailService,
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

  /**
   * Inscription d'un nouvel utilisateur
   */
  async signup(email: string, password: string, confirmPassword: string) {
    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = this.userRepo.create({
      email,
      passwordHash,
      role: 'user',
      isActive: true,
    });

    await this.userRepo.save(user);

    // Générer les tokens JWT
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
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  async requestPasswordReset(email: string) {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepo.findOne({ where: { email, isActive: true } });
    
    // Ne pas révéler si l'email existe ou non (sécurité)
    if (!user) {
      // Retourner un message générique pour ne pas révéler l'existence de l'email
      return {
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      };
    }

    // Générer un token sécurisé
    const resetToken = randomBytes(32).toString('hex');
    
    // Date d'expiration: 1 heure
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    // Créer ou mettre à jour le token de réinitialisation
    // Invalider les anciens tokens non utilisés pour cet utilisateur
    await this.resetTokenRepo.update(
      { userId: user.id, used: false },
      { used: true }
    );

    // Créer un nouveau token
    const resetTokenEntity = this.resetTokenRepo.create({
      userId: user.id,
      token: resetToken,
      expiresAt,
      used: false,
    });

    await this.resetTokenRepo.save(resetTokenEntity);

    // Envoyer l'email
    try {
      await this.emailService.sendPasswordResetEmail(email, resetToken);
    } catch (error) {
      // Si l'envoi d'email échoue, supprimer le token créé
      await this.resetTokenRepo.delete({ token: resetToken });
      throw new HttpException(
        'Impossible d\'envoyer l\'email de réinitialisation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
    };
  }

  /**
   * Réinitialiser le mot de passe avec un token
   */
  async resetPassword(token: string, newPassword: string, confirmPassword: string) {
    // Vérifier que les mots de passe correspondent
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // Trouver le token
    const resetToken = await this.resetTokenRepo.findOne({
      where: { token, used: false },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new UnauthorizedException('Token de réinitialisation invalide ou déjà utilisé');
    }

    // Vérifier que le token n'est pas expiré
    if (new Date() > resetToken.expiresAt) {
      await this.resetTokenRepo.update({ id: resetToken.id }, { used: true });
      throw new UnauthorizedException('Token de réinitialisation expiré');
    }

    // Hasher le nouveau mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Mettre à jour le mot de passe de l'utilisateur
    await this.userRepo.update(
      { id: resetToken.userId },
      { passwordHash },
    );

    // Marquer le token comme utilisé
    await this.resetTokenRepo.update({ id: resetToken.id }, { used: true });

    return {
      message: 'Mot de passe réinitialisé avec succès',
    };
  }
}


