#!/usr/bin/env ts-node

/**
 * Seed script for Roles and Permissions
 * 
 * Run with: npm run seed:roles-permissions
 * Or: ts-node src/scripts/seed.ts
 */

import { DataSource } from 'typeorm';
import { runSeed } from '../seeds/roles-permissions.seed';

// Import entities to ensure they're registered
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user-role.entity';
import { Organization } from '../entities/organization.entity';

// Database configuration
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'viridial',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'viridial',
  entities: [Role, Permission, User, UserRole, Organization],
  synchronize: false, // Never use synchronize in production
  logging: process.env.NODE_ENV !== 'production',
});

runSeed(dataSource);

