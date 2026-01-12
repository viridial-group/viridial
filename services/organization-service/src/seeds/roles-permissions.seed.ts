import { DataSource } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

/**
 * Seed data for Roles and Permissions
 * 
 * Run this seed file to populate the database with initial roles and permissions.
 * 
 * Usage:
 * - Import and call seedRolesAndPermissions() in your migration or startup script
 * - Or create a CLI command to run seeds
 */

export interface SeedPermission {
  resource: string;
  action: string;
  description?: string;
}

export interface SeedRole {
  name: string;
  description?: string;
  organizationId?: string | null; // null = global role
  permissions: string[]; // Array of permission IDs or resource:action patterns
}

/**
 * Default permissions to seed
 */
export const DEFAULT_PERMISSIONS: SeedPermission[] = [
  // Organization permissions
  { resource: 'organization', action: 'read', description: 'View organization details' },
  { resource: 'organization', action: 'write', description: 'Create and update organizations' },
  { resource: 'organization', action: 'delete', description: 'Delete organizations' },
  { resource: 'organization', action: 'admin', description: 'Full organization administration' },
  
  // User permissions
  { resource: 'user', action: 'read', description: 'View user details' },
  { resource: 'user', action: 'write', description: 'Create and update users' },
  { resource: 'user', action: 'delete', description: 'Delete users' },
  { resource: 'user', action: 'admin', description: 'Full user administration' },
  
  // Role permissions
  { resource: 'role', action: 'read', description: 'View roles' },
  { resource: 'role', action: 'write', description: 'Create and update roles' },
  { resource: 'role', action: 'delete', description: 'Delete roles' },
  { resource: 'role', action: 'admin', description: 'Full role administration' },
  
  // Permission permissions
  { resource: 'permission', action: 'read', description: 'View permissions' },
  { resource: 'permission', action: 'write', description: 'Create and update permissions' },
  { resource: 'permission', action: 'delete', description: 'Delete permissions' },
  { resource: 'permission', action: 'admin', description: 'Full permission administration' },
  
  // Property permissions
  { resource: 'property', action: 'read', description: 'View properties' },
  { resource: 'property', action: 'write', description: 'Create and update properties' },
  { resource: 'property', action: 'delete', description: 'Delete properties' },
  { resource: 'property', action: 'admin', description: 'Full property administration' },
  
  // Client permissions
  { resource: 'client', action: 'read', description: 'View clients' },
  { resource: 'client', action: 'write', description: 'Create and update clients' },
  { resource: 'client', action: 'delete', description: 'Delete clients' },
  { resource: 'client', action: 'admin', description: 'Full client administration' },
  
  // Analytics permissions
  { resource: 'analytics', action: 'read', description: 'View analytics and reports' },
  { resource: 'analytics', action: 'admin', description: 'Full analytics access' },
  
  // Settings permissions
  { resource: 'settings', action: 'read', description: 'View settings' },
  { resource: 'settings', action: 'write', description: 'Update settings' },
  { resource: 'settings', action: 'admin', description: 'Full settings administration' },
];

/**
 * Default roles to seed
 * These roles reference permissions by resource:action pattern
 */
export const DEFAULT_ROLES: SeedRole[] = [
  {
    name: 'Super Admin',
    description: 'System-wide administrator with all permissions',
    organizationId: null, // Global role
    permissions: ['*:*'], // All permissions (handled specially)
  },
  {
    name: 'Organization Admin',
    description: 'Administrator for an organization with full management rights',
    organizationId: null, // Can be assigned to any organization
    permissions: [
      'organization:*',
      'user:*',
      'role:*',
      'property:*',
      'client:*',
      'analytics:read',
      'settings:read',
    ],
  },
  {
    name: 'Manager',
    description: 'Manager with read/write access to properties and clients',
    organizationId: null,
    permissions: [
      'property:read',
      'property:write',
      'client:read',
      'client:write',
      'analytics:read',
    ],
  },
  {
    name: 'Agent',
    description: 'Real estate agent with property and client access',
    organizationId: null,
    permissions: [
      'property:read',
      'property:write',
      'client:read',
      'client:write',
    ],
  },
  {
    name: 'Viewer',
    description: 'Read-only access to properties and clients',
    organizationId: null,
    permissions: [
      'property:read',
      'client:read',
      'analytics:read',
    ],
  },
];

/**
 * Seed permissions into the database
 */
// NOTE: Using any for DataSource type to avoid TypeScript compilation issues with namespace
export async function seedPermissions(dataSource: any): Promise<Map<string, Permission>> {
  const permissionRepo = dataSource.getRepository(Permission);
  const permissionMap = new Map<string, Permission>();

  for (const permData of DEFAULT_PERMISSIONS) {
    // Check if permission already exists
    const existing = await permissionRepo.findOne({
      where: {
        resource: permData.resource,
        action: permData.action,
      },
    });

    if (existing) {
      permissionMap.set(`${permData.resource}:${permData.action}`, existing);
      continue;
    }

    // Create new permission
    const permission = permissionRepo.create({
      resource: permData.resource,
      action: permData.action,
      description: permData.description,
    });

    const saved = await permissionRepo.save(permission);
    permissionMap.set(`${permData.resource}:${permData.action}`, saved);
  }

  return permissionMap;
}

/**
 * Seed roles and assign permissions
 */
// NOTE: Using any for DataSource type to avoid TypeScript compilation issues with namespace
export async function seedRoles(
  dataSource: any,
  permissionMap: Map<string, Permission>,
  organizationId?: string | null,
): Promise<Map<string, Role>> {
  const roleRepo = dataSource.getRepository(Role);
  const roleMap = new Map<string, Role>();

  for (const roleData of DEFAULT_ROLES) {
    // Use provided organizationId or role's default
    const orgId = organizationId !== undefined ? organizationId : roleData.organizationId;

    // Check if role already exists
    const existing = await roleRepo.findOne({
      where: {
        name: roleData.name,
        organizationId: orgId,
      },
      relations: ['permissions'],
    });

    if (existing) {
      roleMap.set(roleData.name, existing);
      continue;
    }

    // Resolve permissions
    const permissions: Permission[] = [];
    
    if (roleData.permissions.includes('*:*')) {
      // Super admin gets all permissions
      permissions.push(...Array.from(permissionMap.values()));
    } else {
      // Resolve permissions by resource:action pattern
      for (const permPattern of roleData.permissions) {
        if (permPattern.endsWith(':*')) {
          // Resource wildcard (e.g., 'property:*')
          const resource = permPattern.replace(':*', '');
          for (const [key, perm] of permissionMap.entries()) {
            if (key.startsWith(`${resource}:`)) {
              permissions.push(perm);
            }
          }
        } else {
          // Specific permission (e.g., 'property:read')
          const perm = permissionMap.get(permPattern);
          if (perm) {
            permissions.push(perm);
          }
        }
      }
    }

    // Create new role
    const role = roleRepo.create({
      name: roleData.name,
      description: roleData.description,
      organizationId: orgId,
      isActive: true,
      permissions,
    });

    const saved = await roleRepo.save(role);
    roleMap.set(roleData.name, saved);
  }

  return roleMap;
}

/**
 * Main seed function
 * Seeds both permissions and roles
 */
// NOTE: Using any for DataSource type to avoid TypeScript compilation issues with namespace
export async function seedRolesAndPermissions(
  dataSource: any,
  organizationId?: string | null,
): Promise<{ permissions: Map<string, Permission>; roles: Map<string, Role> }> {
  console.log('🌱 Seeding permissions...');
  const permissions = await seedPermissions(dataSource);
  console.log(`✅ Seeded ${permissions.size} permissions`);

  console.log('🌱 Seeding roles...');
  const roles = await seedRoles(dataSource, permissions, organizationId);
  console.log(`✅ Seeded ${roles.size} roles`);

  return { permissions, roles };
}

/**
 * CLI command to run seeds
 * Usage: npm run seed:roles-permissions
 */
// NOTE: Using any for DataSource type to avoid TypeScript compilation issues with namespace
export async function runSeed(dataSource: any) {
  try {
    await dataSource.initialize();
    console.log('📦 Database connected');

    const result = await seedRolesAndPermissions(dataSource);
    
    console.log('✅ Seeding completed successfully!');
    console.log(`   - ${result.permissions.size} permissions created`);
    console.log(`   - ${result.roles.size} roles created`);

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

