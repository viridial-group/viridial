-- Quick fix for NULL user_id values in properties table
-- Execute this script to fix the TypeORM synchronization error
-- Usage: See fix-user-id.sh or execute manually via psql/Docker

-- Step 1: Update all NULL user_id values
UPDATE properties
SET user_id = COALESCE(
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
  (SELECT id FROM users LIMIT 1),
  '00000000-0000-0000-0000-000000000001'::uuid
)
WHERE user_id IS NULL;

-- Step 2: Set column to NOT NULL (only if it's currently nullable)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'user_id'
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE properties ALTER COLUMN user_id SET NOT NULL;
    RAISE NOTICE 'Column user_id set to NOT NULL';
  ELSE
    RAISE NOTICE 'Column user_id is already NOT NULL';
  END IF;
END $$;

-- Verify: Check for any remaining NULL values
SELECT 
  COUNT(*) as null_count,
  COUNT(*) FILTER (WHERE user_id IS NULL) as remaining_nulls
FROM properties;

