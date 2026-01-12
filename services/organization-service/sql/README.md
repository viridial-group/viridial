# Organization Service SQL Scripts

This directory contains SQL scripts for creating the database schema and seeding initial data.

## Files

- **`schema.sql`**: Complete database schema with all tables, indexes, and foreign keys
- **`seeds.sql`**: Initial seed data for roles and permissions
- **`create-super-admin.sql`**: Creates a super admin user with default credentials
- **`organizations-seed.sql`**: Sample organizations with addresses, phones, and emails

## Usage

### 1. Create the Database Schema

Run the schema file to create all tables, indexes, and constraints:

```bash
psql -U your_username -d your_database -f sql/schema.sql
```

Or using environment variables:

```bash
psql $DATABASE_URL -f sql/schema.sql
```

### 2. Seed Initial Data

After creating the schema, run the seed file to populate roles and permissions:

```bash
psql -U your_username -d your_database -f sql/seeds.sql
```

Or:

```bash
psql $DATABASE_URL -f sql/seeds.sql
```

### 3. Create Super Admin User (Optional)

After creating the schema and seeding roles/permissions, you can create a super admin user:

```bash
psql -U your_username -d your_database -f sql/create-super-admin.sql
```

Or:

```bash
psql $DATABASE_URL -f sql/create-super-admin.sql
```

**Default Super Admin Credentials:**
- **Email:** `admin@viridial.com`
- **Password:** `Admin@123456`

⚠️ **IMPORTANT:** Change the password immediately after first login!

### 4. Seed Sample Organizations (Optional)

After creating the schema and seeding roles/permissions, you can create sample organizations with their related data:

```bash
psql $DATABASE_URL -f sql/organizations-seed.sql
```

Or:

```bash
psql -U your_username -d your_database -f sql/organizations-seed.sql
```

This will create:
- **3 sample organizations** (including a parent-child relationship example)
- **4 organization addresses** (headquarters and branches)
- **7 organization phones** (main, sales, support)
- **7 organization emails** (main, sales, support, billing)

## Schema Overview

The schema includes the following tables:

### Core Tables
- **organizations**: Organization/company information
- **users**: User accounts with authentication
- **roles**: RBAC roles (with hierarchy support)
- **permissions**: RBAC permissions
- **resources**: Resources that permissions act upon
- **features**: Features that group permissions

### Junction Tables
- **user_roles**: Many-to-many relationship between users and roles
- **role_permissions**: Many-to-many relationship between roles and permissions
- **feature_permissions**: Many-to-many relationship between features and permissions

### Organization Related Tables
- **organization_addresses**: Multiple addresses per organization
- **organization_phones**: Multiple phone numbers per organization
- **organization_emails**: Multiple email addresses per organization

### Authentication Tables
- **password_reset_tokens**: Password reset tokens
- **email_verification_tokens**: Email verification tokens

## Important Notes

### Internal Codes

All entities (except junction tables) have an `internal_code` field that is:
- **Format**: `{PREFIX}-{8 char hex}` (e.g., `ORG-ABCD1234`)
- **Auto-generated**: In the application via `BeforeInsert` hooks
- **Required**: Must be provided when inserting via SQL
- **Unique**: Enforced by database constraint

The seed script uses a simple hash approach for generating internal codes in SQL, but in production, you should use the application's code generator for consistency.

### UUIDs

All primary keys use UUID v4. The `uuid-ossp` extension is enabled automatically in the schema script.

### Foreign Keys

All foreign key relationships are defined with appropriate `ON DELETE` actions:
- `CASCADE`: Deletes child records when parent is deleted
- `SET NULL`: Sets foreign key to NULL when parent is deleted

### Indexes

Comprehensive indexes are created for:
- Unique constraints (internal_code, email, slug, etc.)
- Foreign keys
- Frequently queried fields (organization_id, is_active, etc.)
- Composite indexes for common query patterns

## Seed Data

The seed script creates:

### Permissions (30 permissions)
- Organization: read, write, delete, admin
- User: read, write, delete, admin
- Role: read, write, delete, admin
- Permission: read, write, delete, admin
- Property: read, write, delete, admin
- Client: read, write, delete, admin
- Analytics: read, admin
- Settings: read, write, admin

### Roles (5 roles)
- **Super Admin**: All permissions
- **Organization Admin**: Full organization management
- **Manager**: Property and client read/write, analytics read
- **Agent**: Property and client read/write
- **Viewer**: Property and client read-only, analytics read

## Production Considerations

1. **Disable TypeORM synchronize**: As configured, `synchronize: false` in `app.module.ts`
2. **Use migrations**: For schema changes in production, use TypeORM migrations instead of direct SQL
3. **Backup before seeding**: Always backup your database before running seed scripts
4. **Idempotent scripts**: Both scripts use `ON CONFLICT DO NOTHING` to allow safe re-execution
5. **Code generation**: Internal codes in production should use the application's code generator for consistency

## Troubleshooting

### Error: "relation already exists"
- Tables may already exist from previous runs
- Drop tables first: `DROP TABLE IF EXISTS ... CASCADE;`
- Or use migrations for incremental changes

### Error: "uuid-ossp extension not found"
- Ensure PostgreSQL version supports uuid-ossp
- Manually enable: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`

### Error: "duplicate key value violates unique constraint"
- Seed script uses `ON CONFLICT DO NOTHING` to prevent duplicates
- If errors persist, check for manual inserts with conflicting values

