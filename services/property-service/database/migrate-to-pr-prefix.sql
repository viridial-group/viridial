-- =====================================================
-- Migration Script: Rename all property-related tables to use "pr_" prefix
-- =====================================================
-- This script renames existing tables to use the "pr_" prefix.
-- Run this script BEFORE starting the service if you have existing data.
-- If tables don't exist yet, this script will safely skip renaming.

-- Step 0: First, migrate ENUM columns to code columns if needed (from migrate-to-reference-tables.sql)
DO $$
BEGIN
    -- Migrate status column to status_code if status column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        -- Update status_code from status if status_code is null or empty
        UPDATE properties 
        SET status_code = status 
        WHERE (status_code IS NULL OR status_code = '') 
        AND status IS NOT NULL;
        
        -- Drop the old status column
        ALTER TABLE properties DROP COLUMN IF EXISTS status;
        
        RAISE NOTICE 'Migrated status column to status_code and dropped old status column';
    END IF;

    -- Migrate type column to type_code if type column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        -- Update type_code from type if type_code is null or empty
        UPDATE properties 
        SET type_code = type 
        WHERE (type_code IS NULL OR type_code = '') 
        AND type IS NOT NULL;
        
        -- Drop the old type column
        ALTER TABLE properties DROP COLUMN IF EXISTS type;
        
        RAISE NOTICE 'Migrated type column to type_code and dropped old type column';
    END IF;

    -- Ensure all properties have valid status_code and type_code
    UPDATE properties 
    SET status_code = 'draft' 
    WHERE status_code IS NULL OR status_code = '';

    UPDATE properties 
    SET type_code = 'other' 
    WHERE type_code IS NULL OR type_code = '';

    -- Add NOT NULL constraints if they don't exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'status_code'
        AND is_nullable = 'YES'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties 
        ALTER COLUMN status_code SET NOT NULL;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'properties' 
        AND column_name = 'type_code'
        AND is_nullable = 'YES'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE properties 
        ALTER COLUMN type_code SET NOT NULL;
    END IF;
END $$;

-- Step 1: Rename reference tables (must be done first due to foreign keys)
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

-- Step 2: Rename main tables
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

-- Step 3: Update foreign key constraints to reference new table names
DO $$
BEGIN
    -- Update foreign key constraint names (if they exist)
    -- Note: PostgreSQL automatically updates FK references when tables are renamed
    -- But we need to update constraint names to match new naming convention
    
    -- Update fk_property_neighborhood
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_property_neighborhood' 
        AND table_name = 'pr_properties'
    ) THEN
        ALTER TABLE pr_properties RENAME CONSTRAINT fk_property_neighborhood TO fk_pr_property_neighborhood;
    END IF;

    -- Update fk_property_status
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_property_status' 
        AND table_name = 'pr_properties'
    ) THEN
        ALTER TABLE pr_properties RENAME CONSTRAINT fk_property_status TO fk_pr_property_status;
    END IF;

    -- Update fk_property_type
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_property_type' 
        AND table_name = 'pr_properties'
    ) THEN
        ALTER TABLE pr_properties RENAME CONSTRAINT fk_property_type TO fk_pr_property_type;
    END IF;

    -- Update fk_translation_property
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_translation_property' 
        AND table_name = 'pr_property_translations'
    ) THEN
        ALTER TABLE pr_property_translations RENAME CONSTRAINT fk_translation_property TO fk_pr_translation_property;
    END IF;

    -- Update fk_details_property
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_details_property' 
        AND table_name = 'pr_property_details'
    ) THEN
        ALTER TABLE pr_property_details RENAME CONSTRAINT fk_details_property TO fk_pr_details_property;
    END IF;

    -- Update fk_flag_property
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_flag_property' 
        AND table_name = 'pr_property_flags'
    ) THEN
        ALTER TABLE pr_property_flags RENAME CONSTRAINT fk_flag_property TO fk_pr_flag_property;
    END IF;

    -- Update fk_flag_status
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_flag_status' 
        AND table_name = 'pr_property_flags'
    ) THEN
        ALTER TABLE pr_property_flags RENAME CONSTRAINT fk_flag_status TO fk_pr_flag_status;
    END IF;

    -- Update fk_favorite_property
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_favorite_property' 
        AND table_name = 'pr_property_favorites'
    ) THEN
        ALTER TABLE pr_property_favorites RENAME CONSTRAINT fk_favorite_property TO fk_pr_favorite_property;
    END IF;

    -- Update fk_field_type
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_field_type' 
        AND table_name = 'pr_custom_field_definitions'
    ) THEN
        ALTER TABLE pr_custom_field_definitions RENAME CONSTRAINT fk_field_type TO fk_pr_field_type;
    END IF;

    -- Update fk_value_field_def
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_value_field_def' 
        AND table_name = 'pr_custom_field_values'
    ) THEN
        ALTER TABLE pr_custom_field_values RENAME CONSTRAINT fk_value_field_def TO fk_pr_value_field_def;
    END IF;

    -- Update fk_import_status
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_import_status' 
        AND table_name = 'pr_import_jobs'
    ) THEN
        ALTER TABLE pr_import_jobs RENAME CONSTRAINT fk_import_status TO fk_pr_import_status;
    END IF;

    -- Update fk_property_type_parent
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_property_type_parent' 
        AND table_name = 'pr_property_types'
    ) THEN
        ALTER TABLE pr_property_types RENAME CONSTRAINT fk_property_type_parent TO fk_pr_property_type_parent;
    END IF;
END $$;

-- Step 4: Update index names (optional, for consistency)
DO $$
BEGIN
    -- Update indexes for pr_properties
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_properties_internal_code' AND tablename = 'pr_properties') THEN
        ALTER INDEX idx_properties_internal_code RENAME TO idx_pr_properties_internal_code;
    END IF;
    -- Note: Other indexes will be automatically updated by TypeORM synchronize
END $$;

-- Step 5: Verify migration
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND (
        table_name LIKE 'pr_%' OR
        table_name IN ('property_statuses', 'property_types', 'flag_statuses', 'custom_field_types', 'import_statuses',
                      'neighborhoods', 'properties', 'property_translations', 'property_details', 
                      'property_flags', 'property_favorites', 'custom_field_definitions', 
                      'custom_field_values', 'import_jobs')
    );
    
    RAISE NOTICE 'Found % property-related tables', table_count;
    
    -- Check for old tables without prefix
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('properties', 'property_statuses', 'property_types')
    ) THEN
        RAISE WARNING 'Old tables without pr_ prefix still exist. Migration may be incomplete.';
    ELSE
        RAISE NOTICE 'All tables successfully migrated to pr_ prefix';
    END IF;
END $$;

-- Migration complete
SELECT 'Migration to pr_ prefix completed successfully' AS result;

