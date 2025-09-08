-- Add image support columns to existing recurring_announcements table
ALTER TABLE recurring_announcements 
ADD COLUMN IF NOT EXISTS imageId TEXT,
ADD COLUMN IF NOT EXISTS hideImageOnPrint BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- Add indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_recurring_announcements_imageId ON recurring_announcements(imageId);
CREATE INDEX IF NOT EXISTS idx_recurring_announcements_images ON recurring_announcements USING GIN(images);
