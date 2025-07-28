-- Temporarily disable RLS for testing
ALTER TABLE announcement_submissions DISABLE ROW LEVEL SECURITY;

-- Alternative: Enable RLS with simpler policies
-- ALTER TABLE announcement_submissions ENABLE ROW LEVEL SECURITY;
-- 
-- -- Allow all operations for authenticated users
-- CREATE POLICY "Allow all operations for authenticated users" ON announcement_submissions
-- FOR ALL USING (auth.role() = 'authenticated');
-- 
-- -- Allow public insert for submission form
-- CREATE POLICY "Allow public insert" ON announcement_submissions
-- FOR INSERT WITH CHECK (true); 