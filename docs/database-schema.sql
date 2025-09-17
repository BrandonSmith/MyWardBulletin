-- MyWardBulletin Database Schema
-- This file contains the complete database schema for contributors to set up their own Supabase instance

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    profile_slug TEXT UNIQUE,
    active_bulletin_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bulletins (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT NOT NULL UNIQUE,
    meeting_date DATE NOT NULL,
    meeting_type TEXT NOT NULL,
    view_permission TEXT DEFAULT 'private',
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    visibility TEXT DEFAULT 'private',
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(key, created_by)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bulletins_created_by ON public.bulletins(created_by);
CREATE INDEX IF NOT EXISTS idx_bulletins_slug ON public.bulletins(slug);
CREATE INDEX IF NOT EXISTS idx_tokens_created_by ON public.tokens(created_by);
CREATE INDEX IF NOT EXISTS idx_tokens_key ON public.tokens(key);
CREATE INDEX IF NOT EXISTS idx_users_profile_slug ON public.users(profile_slug);

-- Row Level Security (RLS) Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulletins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Bulletins table policies
CREATE POLICY "Users can view their own bulletins" ON public.bulletins
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create bulletins" ON public.bulletins
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own bulletins" ON public.bulletins
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own bulletins" ON public.bulletins
    FOR DELETE USING (auth.uid() = created_by);

-- Tokens table policies
CREATE POLICY "Users can view their own tokens" ON public.tokens
    FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create tokens" ON public.tokens
    FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own tokens" ON public.tokens
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own tokens" ON public.tokens
    FOR DELETE USING (auth.uid() = created_by);

-- Function to automatically create user record on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user record on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Set up Supabase Auth
-- You'll need to configure the following in your Supabase dashboard:
-- 1. Go to Authentication → Settings
-- 2. Enable email confirmations if desired
-- 3. Set up any additional auth providers you want to use