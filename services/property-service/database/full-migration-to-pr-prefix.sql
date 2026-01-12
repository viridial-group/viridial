-- =====================================================
-- Complete Migration Script: ENUM to Code + Rename to pr_ prefix
-- =====================================================
-- This script handles BOTH:
-- 1. Migration from ENUM columns (status, type) to code columns (status_code, type_code)
-- 2. Renaming all tables to use "pr_" prefix
-- Run this script BEFORE starting the service if you have existing data.

-- =====================================================
-- STEP 1: Migrate ENUM columns to code columns (if they exist)
-- =====================================================
DO $$
BEGIN
    -- Check if we're working with 'properties' or 'pr_properties'
    DECLARE
        table_name_var TEXT;
    BEGIN
        -- Determine which table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pr_properties' AND table_schema = 'public') THEN
            table_name_var := 'pr_properties';
        ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties' AND table_schema = 'public') THEN
            table_name_var := 'properties';
        ELSE
            RAISE NOTICE 'No properties table found. Skipping ENUM migration.';
            RETURN;
        END IF;

        -- Migrate status column to status_code if status column exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = table_name_var
            AND column_name = 'status'
            AND table_schema = 'public'
        ) THEN
            EXECUTE format('UPDATE %I SET status_code = status WHERE (status_code IS NULL OR status_code = '''') AND status IS NOT NULL', table_name_var);
            EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS status', table_name_var);
            RAISE NOTICE 'Migrated status column to status_code and dropped old status column';
        END IF;

        -- Migrate type column to type_code if type column exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = table_name_var
            AND column_name = 'type'
            AND table_schema = 'public'
        ) THEN
            EXECUTE format('UPDATE %I SET type_code = type WHERE (type_code IS NULL OR type_code = '''') AND type IS NOT NULL', table_name_var);
            EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS type', table_name_var);
            RAISE NOTICE 'Migrated type column to type_code and dropped old type column';
        END IF;

        -- Ensure all properties have valid status_code and type_code
        EXECUTE format('UPDATE %I SET status_code = ''draft'' WHERE status_code IS NULL OR status_code = ''''', table_name_var);
        EXECUTE format('UPDATE %I SET type_code = ''other'' WHERE type_code IS NULL OR type_code = ''''', table_name_var);

        -- Add NOT NULL constraints if they don't exist
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = table_name_var
            AND column_name = 'status_code'
            AND is_nullable = 'YES'
            AND table_schema = 'public'
        ) THEN
            EXECUTE format('ALTER TABLE %I ALTER COLUMN status_code SET NOT NULL', table_name_var);
            RAISE NOTICE 'Added NOT NULL constraint to status_code';
        END IF;

        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = table_name_var
            AND column_name = 'type_code'
            AND is_nullable = 'YES'
            AND table_schema = 'public'
        ) THEN
            EXECUTE format('ALTER TABLE %I ALTER COLUMN type_code SET NOT NULL', table_name_var);
            RAISE NOTICE 'Added NOT NULL constraint to type_code';
        END IF;
    END;
END $$;

-- =====================================================
-- STEP 2: Rename reference tables (must be done first due to foreign keys)
-- =====================================================
DO $$
BEGIN
    -- Rename property_statuses to pr_property_statuses
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_statuses' AND table_schema = 'public') THEN
        ALTER TABLE property_statuses RENAME TO pr_property_statuses;
        RAISE NOTICE 'Renamed property_statuses to pr_property_statuses';
    END IF;

    -- Rename property_types to pr_property_types
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_types' AND table_schema = 'public') THEN
        ALTER TABLE property_types RENAME TO pr_property_types;
        RAISE NOTICE 'Renamed property_types to pr_property_types';
    END IF;

    -- Rename flag_statuses to pr_flag_statuses
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'flag_statuses' AND table_schema = 'public') THEN
        ALTER TABLE flag_statuses RENAME TO pr_flag_statuses;
        RAISE NOTICE 'Renamed flag_statuses to pr_flag_statuses';
    END IF;

    -- Rename custom_field_types to pr_custom_field_types
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'custom_field_types' AND table_schema = 'public') THEN
        ALTER TABLE custom_field_types RENAME TO pr_custom_field_types;
        RAISE NOTICE 'Renamed custom_field_types to pr_custom_field_types';
    END IF;

    -- Rename import_statuses to pr_import_statuses
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'import_statuses' AND table_schema = 'public') THEN
        ALTER TABLE import_statuses RENAME TO pr_import_statuses;
        RAISE NOTICE 'Renamed import_statuses to pr_import_statuses';
    END IF;
END $$;

-- =====================================================
-- STEP 3: Rename main tables
-- =====================================================
DO $$
BEGIN
    -- Rename neighborhoods to pr_neighborhoods
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'neighborhoods' AND table_schema = 'public') THEN
        ALTER TABLE neighborhoods RENAME TO pr_neighborhoods;
        RAISE NOTICE 'Renamed neighborhoods to pr_neighborhoods';
    END IF;

    -- Rename properties to pr_properties
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties' AND table_schema = 'public') THEN
        ALTER TABLE properties RENAME TO pr_properties;
        RAISE NOTICE 'Renamed properties to pr_properties';
    END IF;

    -- Rename property_translations to pr_property_translations
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_translations' AND table_schema = 'public') THEN
        ALTER TABLE property_translations RENAME TO pr_property_translations;
        RAISE NOTICE 'Renamed property_translations to pr_property_translations';
    END IF;

    -- Rename property_details to pr_property_details
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_details' AND table_schema = 'public') THEN
        ALTER TABLE property_details RENAME TO pr_property_details;
        RAISE NOTICE 'Renamed property_details to pr_property_details';
    END IF;

    -- Rename property_flags to pr_property_flags
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_flags' AND table_schema = 'public') THEN
        ALTER TABLE property_flags RENAME TO pr_property_flags;
        RAISE NOTICE 'Renamed property_flags to pr_property_flags';
    END IF;

    -- Rename property_favorites to pr_property_favorites
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_favorites' AND table_schema = 'public') THEN
        ALTER TABLE property_favorites RENAME TO pr_property_favorites;
        RAISE NOTICE 'Renamed property_favorites to pr_property_favorites';
    END IF;

    -- Rename custom_field_definitions to pr_custom_field_definitions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'custom_field_definitions' AND table_schema = 'public') THEN
        ALTER TABLE custom_field_definitions RENAME TO pr_custom_field_definitions;
        RAISE NOTICE 'Renamed custom_field_definitions to pr_custom_field_definitions';
    END IF;

    -- Rename custom_field_values to pr_custom_field_values
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'custom_field_values' AND table_schema = 'public') THEN
        ALTER TABLE custom_field_values RENAME TO pr_custom_field_values;
        RAISE NOTICE 'Renamed custom_field_values to pr_custom_field_values';
    END IF;

    -- Rename import_jobs to pr_import_jobs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'import_jobs' AND table_schema = 'public') THEN
        ALTER TABLE import_jobs RENAME TO pr_import_jobs;
        RAISE NOTICE 'Renamed import_jobs to pr_import_jobs';
    END IF;
END $$;

-- =====================================================
-- STEP 4: Update foreign key constraint names (optional, for consistency)
-- =====================================================
DO $$
BEGIN
    -- Update constraint names in pr_properties
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_property_neighborhood' 
        AND table_name = 'pr_properties'
    ) THEN
        ALTER TABLE pr_properties RENAME CONSTRAINT fk_property_neighborhood TO fk_pr_property_neighborhood;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_property_status' 
        AND table_name = 'pr_properties'
    ) THEN
        ALTER TABLE pr_properties RENAME CONSTRAINT fk_property_status TO fk_pr_property_status;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_property_type' 
        AND table_name = 'pr_properties'
    ) THEN
        ALTER TABLE pr_properties RENAME CONSTRAINT fk_property_type TO fk_pr_property_type;
    END IF;

    -- Update constraint names in other tables (similar pattern)
    -- Note: PostgreSQL automatically updates FK references when tables are renamed
    -- This step is mainly for naming consistency
END $$;

-- =====================================================
-- STEP 5: Verify migration
-- =====================================================
DO $$
DECLARE
    old_table_count INTEGER;
    new_table_count INTEGER;
    null_status_count INTEGER;
    null_type_count INTEGER;
BEGIN
    -- Count old tables without prefix
    SELECT COUNT(*) INTO old_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('properties', 'property_statuses', 'property_types', 'neighborhoods',
                      'property_translations', 'property_details', 'property_flags',
                      'property_favorites', 'custom_field_definitions', 'custom_field_values',
                      'import_jobs', 'flag_statuses', 'custom_field_types', 'import_statuses');
    
    -- Count new tables with prefix
    SELECT COUNT(*) INTO new_table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name LIKE 'pr_%';
    
    -- Check for null values in pr_properties
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pr_properties' AND table_schema = 'public') THEN
        SELECT COUNT(*) INTO null_status_count
        FROM pr_properties
        WHERE status_code IS NULL OR status_code = '';
        
        SELECT COUNT(*) INTO null_type_count
        FROM pr_properties
        WHERE type_code IS NULL OR type_code = '';
        
        IF null_status_count > 0 THEN
            RAISE WARNING 'Found % properties with null or empty status_code', null_status_count;
        END IF;
        
        IF null_type_count > 0 THEN
            RAISE WARNING 'Found % properties with null or empty type_code', null_type_count;
        END IF;
    END IF;
    
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '  Old tables (without pr_ prefix): %', old_table_count;
    RAISE NOTICE '  New tables (with pr_ prefix): %', new_table_count;
    
    IF old_table_count > 0 THEN
        RAISE WARNING 'Some old tables still exist. Migration may be incomplete.';
    ELSE
        RAISE NOTICE 'All tables successfully migrated to pr_ prefix';
    END IF;
END $$;

-- Migration complete
SELECT 'Full migration to pr_ prefix completed successfully' AS result;

