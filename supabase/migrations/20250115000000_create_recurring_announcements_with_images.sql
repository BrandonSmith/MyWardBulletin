-- Create recurring announcements table with image support
CREATE TABLE IF NOT EXISTS recurring_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  audience TEXT DEFAULT 'ward',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Image support fields
  imageId TEXT, -- Legacy single image support
  hideImageOnPrint BOOLEAN DEFAULT FALSE, -- Legacy print hiding
  images JSONB DEFAULT '[]'::jsonb -- Multiple images support as JSON array
);

-- Enable RLS on recurring_announcements table
ALTER TABLE recurring_announcements ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view recurring announcements for their profile_slug
CREATE POLICY "Users can view recurring announcements for their profile" ON recurring_announcements
FOR SELECT USING (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Policy to allow users to insert recurring announcements for their profile_slug
CREATE POLICY "Users can insert recurring announcements for their profile" ON recurring_announcements
FOR INSERT WITH CHECK (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Policy to allow users to update recurring announcements for their profile_slug
CREATE POLICY "Users can update recurring announcements for their profile" ON recurring_announcements
FOR UPDATE USING (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Policy to allow users to delete recurring announcements for their profile_slug
CREATE POLICY "Users can delete recurring announcements for their profile" ON recurring_announcements
FOR DELETE USING (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_recurring_announcements_profile_slug ON recurring_announcements(profile_slug);
CREATE INDEX IF NOT EXISTS idx_recurring_announcements_is_active ON recurring_announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_recurring_announcements_created_at ON recurring_announcements(created_at);
