-- Fix NULL user_id values in properties table
-- This script updates any NULL user_id values to a default admin user
-- and ensures the column is NOT NULL

-- Step 1: Check for NULL values
DO $$
DECLARE
  null_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_count
  FROM properties
  WHERE user_id IS NULL;
  
  IF null_count > 0 THEN
    RAISE NOTICE 'Found % properties with NULL user_id. Updating...', null_count;
    
    -- Update NULL user_id to the first admin user (or first available user)
    UPDATE properties
    SET user_id = COALESCE(
      (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
      (SELECT id FROM users LIMIT 1),
      '00000000-0000-0000-0000-000000000001'::uuid
    )
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Updated % properties with NULL user_id', null_count;
  ELSE
    RAISE NOTICE 'No NULL user_id values found.';
  END IF;
END $$;

-- Step 2: Ensure the column is NOT NULL (if it's not already)
DO $$
BEGIN
  -- Check if column allows NULL
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'user_id'
    AND is_nullable = 'YES'
  ) THEN
    -- First, ensure no NULL values exist
    UPDATE properties
    SET user_id = COALESCE(
      user_id,
      (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
      (SELECT id FROM users LIMIT 1),
      '00000000-0000-0000-0000-000000000001'::uuid
    )
    WHERE user_id IS NULL;
    
    -- Then alter the column to NOT NULL
    ALTER TABLE properties 
    ALTER COLUMN user_id SET NOT NULL;
    
    RAISE NOTICE 'Column user_id set to NOT NULL';
  ELSE
    RAISE NOTICE 'Column user_id is already NOT NULL';
  END IF;
END $$;

