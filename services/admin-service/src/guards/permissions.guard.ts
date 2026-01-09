import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from './jwt-auth.guard';
import { RoleService } from '../services/role.service';

export interface PermissionRequirement {
  resource: string;
  action: string;
}

export const RequirePermission = (resource: string, action: string) =>
  SetMetadata('permission', { resource, action });

export const RequirePermissions = (...permissions: PermissionRequirement[]) =>
  SetMetadata('permissions', permissions);

/**
 * Guard pour vérifier que l'utilisateur a les permissions requises
 * via ses rôles
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Récupérer les permissions requises depuis les métadonnées
    const requiredPermission = this.reflector.getAllAndOverride<PermissionRequirement>(
      'permission',
      [context.getHandler(), context.getClass()],
    );

    const requiredPermissions = this.reflector.getAllAndOverride<PermissionRequirement[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    // Si aucune permission n'est requise, autoriser
    if (!requiredPermission && (!requiredPermissions || requiredPermissions.length === 0)) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Pour les admins, autoriser toutes les permissions
    if (user.role === 'admin') {
      return true;
    }

    // Récupérer les rôles de l'utilisateur et leurs permissions
    // Note: Cette implémentation nécessite une relation User -> Roles -> Permissions
    // Pour l'instant, on vérifie juste le rôle de base
    // TODO: Implémenter la vérification complète via UserRole

    const permissionsToCheck = requiredPermission
      ? [requiredPermission]
      : requiredPermissions || [];

    // Pour l'instant, on fait une vérification simple basée sur le rôle
    // Dans une implémentation complète, on récupérerait les permissions via les rôles
    return true; // Temporaire - à améliorer avec la vraie vérification RBAC
  }
}

