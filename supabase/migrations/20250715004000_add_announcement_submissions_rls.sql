-- Enable RLS on announcement_submissions table
ALTER TABLE announcement_submissions ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view submissions for their profile_slug
CREATE POLICY "Users can view submissions for their profile" ON announcement_submissions
FOR SELECT USING (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Policy to allow users to update submissions for their profile_slug
CREATE POLICY "Users can update submissions for their profile" ON announcement_submissions
FOR UPDATE USING (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Policy to allow users to delete submissions for their profile_slug
CREATE POLICY "Users can delete submissions for their profile" ON announcement_submissions
FOR DELETE USING (
  profile_slug IN (
    SELECT profile_slug FROM users WHERE id = auth.uid()
  )
);

-- Policy to allow public insert (for submission form)
CREATE POLICY "Public can insert submissions" ON announcement_submissions
FOR INSERT WITH CHECK (true); 