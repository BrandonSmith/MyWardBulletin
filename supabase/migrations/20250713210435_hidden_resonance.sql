/*
  # Add profile_slug column to users table

  1. New Columns
    - `profile_slug` (text, unique, nullable)
      - Custom slug for user's permanent QR code URL
      - Used to create URLs like /u/sunset-hills-ward
      - Must be unique across all users

  2. Security
    - No RLS changes needed - uses existing user policies
    - Unique constraint prevents duplicate slugs

  3. Notes
    - Column is nullable to allow gradual migration
    - Users can set their slug when they want QR codes
*/

-- Add profile_slug column to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'profile_slug'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_slug text UNIQUE;
  END IF;
END $$;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_profile_slug ON users(profile_slug);