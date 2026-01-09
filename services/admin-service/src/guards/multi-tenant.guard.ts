import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthenticatedUser } from './jwt-auth.guard';

/**
 * Guard pour l'isolation multi-tenant
 * Vérifie que l'utilisateur ne peut accéder qu'aux ressources de son organisation
 */
@Injectable()
export class MultiTenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser = request.user;

    if (!user) {
      return false;
    }

    // Les admins système peuvent accéder à toutes les organisations
    if (user.role === 'admin' && !user.organizationId) {
      return true;
    }

    // Vérifier que l'organizationId dans la requête correspond à celle de l'utilisateur
    const requestedOrgId =
      request.body?.organizationId ||
      request.params?.organizationId ||
      request.query?.organizationId;

    // Si pas d'organizationId demandé, utiliser celui de l'utilisateur
    if (!requestedOrgId) {
      if (user.organizationId) {
        request.body = { ...request.body, organizationId: user.organizationId };
      }
      return true;
    }

    // Vérifier que l'utilisateur peut accéder à cette organisation
    if (user.organizationId && requestedOrgId !== user.organizationId) {
      throw new ForbiddenException(
        'Access denied: You can only access resources from your own organization',
      );
    }

    return true;
  }
}

