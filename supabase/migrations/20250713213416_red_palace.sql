/*
  # Fix tokens table ward_id removal

  This migration ensures the ward_id column is properly removed from the tokens table
  and handles any remaining constraints or dependencies.

  1. Drop any remaining foreign key constraints
  2. Remove NOT NULL constraint from ward_id if it exists
  3. Drop the ward_id column completely
  4. Update any remaining policies that might reference ward_id
*/

-- First, let's check if the ward_id column still exists and handle it
DO $$
BEGIN
  -- Drop foreign key constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tokens_ward_id_fkey' 
    AND table_name = 'tokens'
  ) THEN
    ALTER TABLE public.tokens DROP CONSTRAINT tokens_ward_id_fkey;
  END IF;

  -- Remove NOT NULL constraint if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tokens' 
    AND column_name = 'ward_id'
  ) THEN
    -- First remove NOT NULL constraint
    ALTER TABLE public.tokens ALTER COLUMN ward_id DROP NOT NULL;
    
    -- Then drop the column entirely
    ALTER TABLE public.tokens DROP COLUMN ward_id;
  END IF;
END $$;

-- Also ensure the unique constraint is updated if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tokens_ward_id_key_key' 
    AND table_name = 'tokens'
  ) THEN
    ALTER TABLE public.tokens DROP CONSTRAINT tokens_ward_id_key_key;
  END IF;
END $$;

-- Create a new unique constraint on just the key and created_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'tokens_key_created_by_key' 
    AND table_name = 'tokens'
  ) THEN
    ALTER TABLE public.tokens ADD CONSTRAINT tokens_key_created_by_key UNIQUE (key, created_by);
  END IF;
END $$;

-- Update any indexes that might reference ward_id
DROP INDEX IF EXISTS idx_tokens_ward_id;
DROP INDEX IF EXISTS idx_tokens_key;

-- Create new index for efficient token lookups
CREATE INDEX IF NOT EXISTS idx_tokens_key_created_by ON public.tokens (key, created_by);
CREATE INDEX IF NOT EXISTS idx_tokens_created_by ON public.tokens (created_by);