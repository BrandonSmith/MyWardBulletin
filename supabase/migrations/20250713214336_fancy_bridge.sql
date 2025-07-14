/*
  # Remove ward_id column from bulletins table - Final Fix

  This migration completely removes the ward_id column and all its dependencies from the bulletins table.

  ## Changes Made
  1. Drop foreign key constraint linking bulletins to wards
  2. Drop unique constraint that includes ward_id  
  3. Drop indexes that reference ward_id
  4. Remove the ward_id column entirely
  5. Add new unique constraint on (created_by, slug)
  6. Create performance index on created_by

  ## Important Notes
  - This will permanently remove the ward_id column
  - Any existing data in ward_id will be lost
  - Bulletins will now be uniquely identified by (created_by, slug) instead of (ward_id, slug)
*/

-- Step 1: Drop foreign key constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bulletins_ward_id_fkey' 
        AND table_name = 'bulletins'
    ) THEN
        ALTER TABLE public.bulletins DROP CONSTRAINT bulletins_ward_id_fkey;
    END IF;
END $$;

-- Step 2: Drop unique constraint that includes ward_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bulletins_ward_id_slug_key' 
        AND table_name = 'bulletins'
    ) THEN
        ALTER TABLE public.bulletins DROP CONSTRAINT bulletins_ward_id_slug_key;
    END IF;
END $$;

-- Step 3: Drop indexes that reference ward_id
DROP INDEX IF EXISTS public.idx_bulletins_ward_id;

-- Step 4: Drop the ward_id column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'bulletins' 
        AND column_name = 'ward_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.bulletins DROP COLUMN ward_id;
    END IF;
END $$;

-- Step 5: Add new unique constraint on (created_by, slug)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bulletins_created_by_slug_key' 
        AND table_name = 'bulletins'
    ) THEN
        ALTER TABLE public.bulletins ADD CONSTRAINT bulletins_created_by_slug_key UNIQUE (created_by, slug);
    END IF;
END $$;

-- Step 6: Create performance index on created_by
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_bulletins_created_by'
    ) THEN
        CREATE INDEX idx_bulletins_created_by ON public.bulletins USING btree (created_by);
    END IF;
END $$;