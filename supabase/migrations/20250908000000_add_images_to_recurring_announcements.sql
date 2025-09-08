-- Add images support to recurring_announcements table
ALTER TABLE recurring_announcements 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add index for the new column
CREATE INDEX IF NOT EXISTS idx_recurring_announcements_images ON recurring_announcements USING GIN(images);