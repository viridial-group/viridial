import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { PasswordResetToken } from '../entities/password-reset-token.entity';
import { EmailVerificationToken } from '../entities/email-verification-token.entity';
import { EmailService } from './email.service';
import { OrganizationService } from './organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';

interface FailedAttempt {
  count: number;
  lastAttempt: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
    @InjectRepository(Role)
    private readonly roleRepo: any,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: any,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: any,
    @InjectRepository(EmailVerificationToken)
    private readonly verificationTokenRepo: any,
    private readonly emailService: EmailService,
    private readonly organizationService: OrganizationService,
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

    // Reload user with roles to determine if they're super admin
    const userWithRoles = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['userRoles', 'userRoles.role'],
    });

    // Determine user role: check legacy role field or check if user has "Super Admin" role
    let userRole = user.role; // Use legacy role field as default
    if (!userRole || userRole === 'user') {
      // Check if user has "Super Admin" role via UserRole relationship
      if (userWithRoles?.userRoles) {
        const superAdminRole = userWithRoles.userRoles.find(
          (ur: any) => ur.role?.name === 'Super Admin' && ur.role?.organizationId === null
        );
        if (superAdminRole) {
          userRole = 'super_admin';
        }
      }
    }

    // Include role and organizationId in JWT payload
    const payload = {
      sub: user.id,
      email: user.email,
      role: userRole,
      organizationId: user.organizationId || null,
    };

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

    const user = await this.userRepo.findOne({
      where: { id: payload.sub, email: payload.email },
      relations: ['userRoles', 'userRoles.role'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (payload.sub !== user.id || payload.email !== user.email) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Determine user role: use from payload if present, otherwise check user
    let userRole = payload.role || user.role;
    if (!userRole || userRole === 'user') {
      // Check if user has "Super Admin" role via UserRole relationship
      if (user.userRoles) {
        const superAdminRole = user.userRoles.find(
          (ur: any) => ur.role?.name === 'Super Admin' && ur.role?.organizationId === null
        );
        if (superAdminRole) {
          userRole = 'super_admin';
        }
      }
    }

    const newPayload = {
      sub: user.id,
      email: user.email,
      role: userRole,
      organizationId: user.organizationId || null,
    };

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

    // Créer l'utilisateur (email non vérifié initialement)
    // Note: organizationId peut être null pour les utilisateurs globaux
    // Le role legacy 'user' est utilisé pour compatibilité, mais l'authentification RBAC utilise UserRole
    const user = this.userRepo.create({
      email,
      passwordHash,
      role: 'user', // Legacy field for backward compatibility
      isActive: true,
      emailVerified: false,
      organizationId: null, // Global user by default, can be assigned to organization later
    });

    await this.userRepo.save(user);

    // Générer un token de vérification d'email
    const verificationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 heures

    const verificationTokenEntity = this.verificationTokenRepo.create({
      userId: user.id,
      token: verificationToken,
      expiresAt,
      used: false,
    });

    await this.verificationTokenRepo.save(verificationTokenEntity);

    // Envoyer l'email de vérification
    try {
      await this.emailService.sendVerificationEmail(email, verificationToken);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      // Ne pas bloquer l'inscription si l'email échoue, mais logger l'erreur
      // L'utilisateur pourra demander un nouveau lien plus tard
    }

    // Générer les tokens JWT (même si email non vérifié, l'utilisateur peut se connecter)
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
        emailVerified: user.emailVerified,
      },
      message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
    };
  }

  /**
   * Signup with organization (for super admin organization setup)
   * Creates both user and organization, then logs the user in automatically
   */
  async signupWithOrganization(
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string | undefined,
    lastName: string | undefined,
    phone: string | undefined,
    preferredLanguage: string | undefined,
    organizationData: CreateOrganizationDto,
  ) {
    // Vérifier que les mots de passe correspondent
    if (password !== confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    // Vérifier que l'email n'existe pas déjà
    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Cet email est déjà utilisé');
    }

    // Créer l'organisation d'abord
    const organization = await this.organizationService.create(organizationData);

    // Hasher le mot de passe
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur avec organizationId
    // Le role legacy 'org_admin' est utilisé pour les admins d'organisation
    const user = this.userRepo.create({
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      preferredLanguage: preferredLanguage || 'en',
      role: 'org_admin', // Legacy field for backward compatibility
      isActive: true,
      emailVerified: true, // Auto-verify for organization setup
      organizationId: organization.id,
    });

    await this.userRepo.save(user);

    // Optionally assign user to Organization Admin role if it exists
    try {
      const orgAdminRole = await this.roleRepo.findOne({
        where: { name: 'Organization Admin', organizationId: organization.id },
      });
      if (orgAdminRole) {
        const userRole = this.userRoleRepo.create({
          userId: user.id,
          roleId: orgAdminRole.id,
        });
        await this.userRoleRepo.save(userRole);
      }
    } catch (error) {
      // Role assignment is optional, continue even if it fails
      console.warn('Could not assign Organization Admin role:', error);
    }

    // Reload user with roles to determine if they're super admin
    const userWithRoles = await this.userRepo.findOne({
      where: { id: user.id },
      relations: ['userRoles', 'userRoles.role'],
    });

    // Déterminer le role (legacy ou depuis UserRole)
    let userRole = userWithRoles.role || 'user';
    let isSuperAdmin = false;
    if (userWithRoles.userRoles && userWithRoles.userRoles.length > 0) {
      const superAdminRoleEntity = userWithRoles.userRoles.find(
        (ur: any) => ur.role?.name === 'Super Admin' || ur.role?.name === 'super_admin',
      );
      if (superAdminRoleEntity) {
        userRole = 'super_admin';
        isSuperAdmin = true;
      } else {
        // Use the first role's name
        userRole = userWithRoles.userRoles[0].role?.name || userRole;
      }
    }

    // Générer les tokens JWT avec role et organizationId
    const payload = {
      sub: user.id,
      email: user.email,
      role: userRole,
      organizationId: organization.id,
    };

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
        role: userRole,
        organizationId: organization.id,
        emailVerified: user.emailVerified,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
      },
      message: 'Organisation créée avec succès. Vous êtes maintenant connecté.',
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

    // Trouver le token (sans relation user, on utilise directement userId) 
    const resetToken = await this.resetTokenRepo.findOne({
      where: { token, used: false },
    });

    if (!resetToken) {
      throw new UnauthorizedException('Token de réinitialisation invalide ou déjà utilisé');
    }

    // Vérifier que le token n'est pas expiré
    if (new Date() > resetToken.expiresAt) {
      await this.resetTokenRepo.update({ id: resetToken.id }, { used: true });
      throw new UnauthorizedException('Token de réinitialisation expiré');
    }

    // Vérifier que l'utilisateur existe
    const user = await this.userRepo.findOne({ where: { id: resetToken.userId } });
    if (!user) {
      await this.resetTokenRepo.update({ id: resetToken.id }, { used: true });
      throw new UnauthorizedException('Utilisateur introuvable pour ce token');
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

  /**
   * Vérifier l'email avec un token
   */
  async verifyEmail(token: string) {
    // Trouver le token de vérification
    const verificationToken = await this.verificationTokenRepo.findOne({
      where: { token, used: false },
    });

    if (!verificationToken) {
      throw new UnauthorizedException('Token de vérification invalide ou déjà utilisé');
    }

    // Vérifier que le token n'est pas expiré
    if (new Date() > verificationToken.expiresAt) {
      await this.verificationTokenRepo.update({ id: verificationToken.id }, { used: true });
      throw new UnauthorizedException('Token de vérification expiré');
    }

    // Vérifier que l'utilisateur existe
    const user = await this.userRepo.findOne({ where: { id: verificationToken.userId } });
    if (!user) {
      await this.verificationTokenRepo.update({ id: verificationToken.id }, { used: true });
      throw new UnauthorizedException('Utilisateur introuvable pour ce token');
    }

    // Marquer l'email comme vérifié
    await this.userRepo.update(
      { id: verificationToken.userId },
      { emailVerified: true },
    );

    // Marquer le token comme utilisé
    await this.verificationTokenRepo.update({ id: verificationToken.id }, { used: true });

    return {
      message: 'Email vérifié avec succès',
      user: {
        id: user.id,
        email: user.email,
        emailVerified: true,
      },
    };
  }

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerificationEmail(email: string) {
    // Vérifier que l'utilisateur existe
    const user = await this.userRepo.findOne({ where: { email, isActive: true } });
    
    if (!user) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      return {
        message: 'Si cet email existe, un nouveau lien de vérification a été envoyé',
      };
    }

    // Vérifier si l'email est déjà vérifié
    if (user.emailVerified) {
      return {
        message: 'Cet email est déjà vérifié',
      };
    }

    // Invalider les anciens tokens non utilisés
    await this.verificationTokenRepo.update(
      { userId: user.id, used: false },
      { used: true }
    );

    // Générer un nouveau token
    const verificationToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const verificationTokenEntity = this.verificationTokenRepo.create({
      userId: user.id,
      token: verificationToken,
      expiresAt,
      used: false,
    });

    await this.verificationTokenRepo.save(verificationTokenEntity);

    // Envoyer l'email
    try {
      await this.emailService.sendVerificationEmail(email, verificationToken);
    } catch (error) {
      // Si l'envoi d'email échoue, supprimer le token créé
      await this.verificationTokenRepo.delete({ token: verificationToken });
      throw new HttpException(
        'Impossible d\'envoyer l\'email de vérification',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      message: 'Si cet email existe, un nouveau lien de vérification a été envoyé',
    };
  }
}

