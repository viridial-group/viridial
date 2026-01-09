import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Admin Guard - Simple role check
 * TODO: Replace with proper RBAC when Admin Service is implemented
 * For now, checks if user has 'role' field in JWT payload with admin value
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Check if user has admin role
    // TODO: Replace with proper RBAC check via Admin Service
    const isAdmin = user.role === 'admin' || 
                    user.role === 'super_admin' || 
                    user.role === 'org_admin' ||
                    user.roles?.includes('admin') ||
                    user.roles?.includes('super_admin');

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}

