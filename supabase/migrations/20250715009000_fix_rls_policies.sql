-- Fix RLS policies for recurring_announcements table to be more permissive
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view recurring announcements for their profile" ON recurring_announcements;
DROP POLICY IF EXISTS "Users can insert recurring announcements for their profile" ON recurring_announcements;
DROP POLICY IF EXISTS "Users can update recurring announcements for their profile" ON recurring_announcements;
DROP POLICY IF EXISTS "Users can delete recurring announcements for their profile" ON recurring_announcements;

-- Create more permissive policies for testing
CREATE POLICY "Allow all operations for authenticated users" ON recurring_announcements
FOR ALL USING (auth.uid() IS NOT NULL); 