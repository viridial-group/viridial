import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OidcService {
  constructor(
    @InjectRepository(User)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement dans l'IDE
    private readonly userRepo: any,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Trouve ou crée un utilisateur à partir des infos Google OAuth
   */
  async findOrCreateUser(googleProfile: any) {
    const { email, googleId, firstName, lastName, picture } = googleProfile;

    // Chercher un user existant par email
    let user = await this.userRepo.findOne({
      where: { email },
    });

    if (!user) {
      // Créer un nouvel utilisateur avec un mot de passe aléatoire (non utilisé pour SSO)
      // En production, on pourrait ajouter un champ `auth_provider` (local/google/etc)
      const randomPassword = await bcrypt.hash(
        `sso-${googleId}-${Date.now()}`,
        10,
      );

      user = this.userRepo.create({
        email,
        passwordHash: randomPassword, // Non utilisé pour SSO, mais requis par le schéma
        role: 'user',
        isActive: true,
      });

      user = await this.userRepo.save(user);
    }

    // En production, on pourrait stocker googleId dans une table séparée `user_oauth_providers`
    // Pour le PoC, on retourne juste le user existant/créé

    return user;
  }

  /**
   * Génère les tokens JWT après authentification OIDC réussie
   */
  async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}

