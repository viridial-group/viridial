-- Create Super Admin User
-- This script creates a super admin user with default credentials
-- 
-- IMPORTANT: Change the password immediately after first login!
-- Default credentials:
--   Email: admin@viridial.com
--   Password: Admin@123456
--
-- Usage: Run this after schema.sql and seeds.sql
--   psql $DATABASE_URL -f sql/create-super-admin.sql

-- Enable pgcrypto extension for password hashing (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Generate a bcrypt hash for the password (Admin@123456)
-- Using bcrypt with cost factor 10 (standard)
-- Note: This hash corresponds to password: Admin@123456
-- To generate a new hash: SELECT crypt('YourPassword', gen_salt('bf', 10));

-- First, we need to find the Super Admin role ID
-- This assumes the Super Admin role was created via seeds.sql
-- If the role doesn't exist, this script will fail - run seeds.sql first

DO $$
DECLARE
    v_super_admin_role_id UUID;
    v_org_id UUID;
    v_user_id UUID;
    v_user_internal_code VARCHAR(50);
    v_org_internal_code VARCHAR(50);
    v_role_internal_code VARCHAR(50);
    v_password_hash VARCHAR(255);
BEGIN
    -- Find the Super Admin role by name
    SELECT id, internal_code INTO v_super_admin_role_id, v_role_internal_code
    FROM roles
    WHERE name = 'Super Admin'
    LIMIT 1;

    -- If Super Admin role doesn't exist, create a default organization first
    -- (This shouldn't happen if seeds.sql was run, but just in case)
    IF v_super_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Super Admin role not found. Please run seeds.sql first.';
    END IF;

    -- Generate internal code for organization (format: ORG-XXXXXXXX)
    v_org_internal_code := 'ORG-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

    -- Check if SaaS Admin organization already exists, if not create it
    SELECT id INTO v_org_id
    FROM organizations
    WHERE name = 'Viridial SaaS Administration'
    LIMIT 1;

    IF v_org_id IS NULL THEN
        -- Create the SaaS Admin organization
        INSERT INTO organizations (
            id,
            internal_code,
            name,
            description,
			slug,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_org_internal_code,
            'Viridial SaaS Administration',
            'Organization for SaaS platform administration and management',
			'viridial-saas-administration',
            true,
            NOW(),
            NOW()
        ) RETURNING id INTO v_org_id;

        RAISE NOTICE 'SaaS Admin organization created with ID: %', v_org_id;
    ELSE
        RAISE NOTICE 'SaaS Admin organization already exists with ID: %. Skipping creation.', v_org_id;
    END IF;

    -- Generate internal code for user (format: USR-XXXXXXXX)
    v_user_internal_code := 'USR-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

    -- Bcrypt hash for password: Admin@123456
    -- This hash was generated using Node.js bcrypt (10 rounds) for compatibility
    -- Generated using: node -p "const bcrypt = require('bcrypt'); bcrypt.hashSync('Admin@123456', 10)"
    -- IMPORTANT: The hash format must match Node.js bcrypt ($2b$10$...)
    v_password_hash := '$2b$10$ygi.mSwgiGsRmmwlqlR7EeUataF/34sk4NZ08RTAI4XkDGJ05lzvS';

    -- Check if super admin user already exists
    SELECT id INTO v_user_id
    FROM users
    WHERE email = 'admin@viridial.com'
    LIMIT 1;

    IF v_user_id IS NULL THEN
        -- Create the super admin user
        INSERT INTO users (
            id,
            internal_code,
            email,
            password_hash,
            first_name,
            last_name,
            role,
            organization_id,
            is_active,
            email_verified,
            preferred_language,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_user_internal_code,
            'admin@viridial.com',
            v_password_hash,
            'Super',
            'Admin',
            'super_admin',
            v_org_id, -- Super admin is linked to SaaS Admin organization
            true,
            true, -- Email verified by default for super admin
            'en',
            NOW(),
            NOW()
        ) RETURNING id INTO v_user_id;

        RAISE NOTICE 'Super admin user created with ID: %', v_user_id;
    ELSE
        RAISE NOTICE 'Super admin user already exists with ID: %. Skipping creation.', v_user_id;
    END IF;

    -- Assign Super Admin role to the user
    INSERT INTO user_roles (user_id, role_id, assigned_at)
    SELECT v_user_id, v_super_admin_role_id, NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = v_user_id AND role_id = v_super_admin_role_id
    );

    RAISE NOTICE 'Super Admin role assigned to user.';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUPER ADMIN CREDENTIALS:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: admin@viridial.com';
    RAISE NOTICE 'Password: Admin@123456';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Change the password immediately after first login!';
    RAISE NOTICE '========================================';

END $$;

