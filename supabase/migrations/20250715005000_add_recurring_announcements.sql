-- Add recurring field to announcement_submissions table
ALTER TABLE announcement_submissions 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT DEFAULT 'weekly';

-- Create a table for recurring announcements that can be assigned to multiple bulletins
CREATE TABLE IF NOT EXISTS recurring_announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  audience TEXT DEFAULT 'ward',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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