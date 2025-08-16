-- Fix RLS policies for recurring_announcements table
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view recurring announcements for their profile" ON recurring_announcements;
DROP POLICY IF EXISTS "Users can insert recurring announcements for their profile" ON recurring_announcements;
DROP POLICY IF EXISTS "Users can update recurring announcements for their profile" ON recurring_announcements;
DROP POLICY IF EXISTS "Users can delete recurring announcements for their profile" ON recurring_announcements;

-- Create simpler, more permissive policies
-- Allow users to view recurring announcements for their profile_slug
CREATE POLICY "Users can view recurring announcements for their profile" ON recurring_announcements
FOR SELECT USING (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Allow users to insert recurring announcements for their profile_slug
CREATE POLICY "Users can insert recurring announcements for their profile" ON recurring_announcements
FOR INSERT WITH CHECK (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Allow users to update recurring announcements for their profile_slug
CREATE POLICY "Users can update recurring announcements for their profile" ON recurring_announcements
FOR UPDATE USING (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Allow users to delete recurring announcements for their profile_slug
CREATE POLICY "Users can delete recurring announcements for their profile" ON recurring_announcements
FOR DELETE USING (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Alternative: If the above still doesn't work, try this more permissive approach
-- Comment out the above policies and uncomment these if needed:

/*
-- More permissive policies for testing
CREATE POLICY "Allow all operations for authenticated users" ON recurring_announcements
FOR ALL USING (auth.uid() IS NOT NULL);

-- Or even more permissive for development:
-- CREATE POLICY "Allow all operations" ON recurring_announcements FOR ALL USING (true);
*/ 