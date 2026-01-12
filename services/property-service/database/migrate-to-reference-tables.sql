-- =====================================================
-- Migration Script: Remove old ENUM columns (type, status)
-- and ensure type_code and status_code are populated
-- =====================================================
-- This script migrates from the old ENUM-based schema to the new
-- reference table-based schema.
-- Run this script BEFORE starting the service if you have existing data.

-- Step 1: Check if old columns exist and migrate data if needed
DO $$
BEGIN
    -- Migrate status column to status_code if status column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pr_properties' 
        AND column_name = 'status'
        AND table_schema = 'public'
    ) THEN
        -- Update status_code from status if status_code is null or empty
        UPDATE pr_properties 
        SET status_code = status 
        WHERE (status_code IS NULL OR status_code = '') 
        AND status IS NOT NULL;
        
        -- Drop the old status column
        ALTER TABLE pr_properties DROP COLUMN IF EXISTS status;
        
        RAISE NOTICE 'Migrated status column to status_code and dropped old status column';
    END IF;

    -- Migrate type column to type_code if type column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pr_properties' 
        AND column_name = 'type'
        AND table_schema = 'public'
    ) THEN
        -- Update type_code from type if type_code is null or empty
        UPDATE pr_properties 
        SET type_code = type 
        WHERE (type_code IS NULL OR type_code = '') 
        AND type IS NOT NULL;
        
        -- Drop the old type column
        ALTER TABLE pr_properties DROP COLUMN IF EXISTS type;
        
        RAISE NOTICE 'Migrated type column to type_code and dropped old type column';
    END IF;
END $$;

-- Step 2: Ensure all properties have valid status_code and type_code
-- Set default values for any null values
-- Note: This will work for both 'properties' and 'pr_properties' tables
DO $$
BEGIN
    -- Try updating pr_properties first (if renamed)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pr_properties' AND table_schema = 'public') THEN
        UPDATE pr_properties 
        SET status_code = 'draft' 
        WHERE status_code IS NULL OR status_code = '';

        UPDATE pr_properties 
        SET type_code = 'other' 
        WHERE type_code IS NULL OR type_code = '';
    -- Fallback to properties if not yet renamed
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties' AND table_schema = 'public') THEN
        UPDATE properties 
        SET status_code = 'draft' 
        WHERE status_code IS NULL OR status_code = '';

        UPDATE properties 
        SET type_code = 'other' 
        WHERE type_code IS NULL OR type_code = '';
    END IF;
END $$;

-- Step 3: Add NOT NULL constraints if they don't exist
DO $$
BEGIN
    -- Make status_code NOT NULL if it's not already
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pr_properties' 
        AND column_name = 'status_code'
        AND is_nullable = 'YES'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pr_properties 
        ALTER COLUMN status_code SET NOT NULL;
        
        RAISE NOTICE 'Added NOT NULL constraint to status_code';
    END IF;

    -- Make type_code NOT NULL if it's not already
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'pr_properties' 
        AND column_name = 'type_code'
        AND is_nullable = 'YES'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE pr_properties 
        ALTER COLUMN type_code SET NOT NULL;
        
        RAISE NOTICE 'Added NOT NULL constraint to type_code';
    END IF;
END $$;

-- Step 4: Verify migration
DO $$
DECLARE
    status_count INTEGER;
    type_count INTEGER;
BEGIN
    -- Check for any null status_code
    SELECT COUNT(*) INTO status_count
    FROM pr_properties
    WHERE status_code IS NULL OR status_code = '';
    
    -- Check for any null type_code
    SELECT COUNT(*) INTO type_count
    FROM pr_properties
    WHERE type_code IS NULL OR type_code = '';
    
    IF status_count > 0 THEN
        RAISE WARNING 'Found % properties with null or empty status_code', status_count;
    ELSE
        RAISE NOTICE 'All properties have valid status_code';
    END IF;
    
    IF type_count > 0 THEN
        RAISE WARNING 'Found % properties with null or empty type_code', type_count;
    ELSE
        RAISE NOTICE 'All properties have valid type_code';
    END IF;
END $$;

-- Migration complete
SELECT 'Migration completed successfully' AS result;

