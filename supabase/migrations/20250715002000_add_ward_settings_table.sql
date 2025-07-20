-- Create ward_settings table for user-specific default leadership values
CREATE TABLE IF NOT EXISTS ward_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  ward_name text,
  default_presiding text,
  default_conducting text,
  default_chorister text,
  default_organist text,
  updated_at timestamp with time zone DEFAULT now()
);

-- Ensure each user can only have one ward_settings row
CREATE UNIQUE INDEX IF NOT EXISTS unique_ward_settings_user_id ON ward_settings(user_id); 