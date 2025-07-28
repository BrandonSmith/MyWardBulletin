CREATE TABLE IF NOT EXISTS announcement_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_slug TEXT NOT NULL,
  submitter_name TEXT NOT NULL,
  submitter_email TEXT,
  submitter_phone TEXT,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  audience TEXT DEFAULT 'ward',
  date TEXT,
  status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
