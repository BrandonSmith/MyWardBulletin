/*
  # Add active_bulletin_id column to users table

  1. Changes
    - Add `active_bulletin_id` column to `users` table
    - Column is nullable UUID type to reference bulletins
    - Add foreign key constraint to bulletins table
    - Add index for performance

  2. Security
    - No RLS changes needed as existing policies will cover the new column
*/

-- Add the active_bulletin_id column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'active_bulletin_id'
  ) THEN
    ALTER TABLE users ADD COLUMN active_bulletin_id uuid;
  END IF;
END $$;

-- Add foreign key constraint to bulletins table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'users_active_bulletin_id_fkey'
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT users_active_bulletin_id_fkey 
    FOREIGN KEY (active_bulletin_id) REFERENCES bulletins(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for performance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_users_active_bulletin_id'
  ) THEN
    CREATE INDEX idx_users_active_bulletin_id ON users(active_bulletin_id);
  END IF;
END $$;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS default_ward_name text,
ADD COLUMN IF NOT EXISTS default_presiding text,
ADD COLUMN IF NOT EXISTS default_music_director text,
ADD COLUMN IF NOT EXISTS default_organist text;