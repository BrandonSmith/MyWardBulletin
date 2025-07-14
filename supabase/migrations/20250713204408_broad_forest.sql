/*
  # Fix RLS Recursion Issues

  This migration fixes the infinite recursion issues in Row Level Security policies
  by creating helper functions and updating existing policies.

  ## Changes Made

  1. **Helper Functions**
     - `get_current_user_ward_id()` - Securely gets current user's ward_id
     - `get_current_user_role()` - Securely gets current user's role
     - Both use SECURITY DEFINER to bypass RLS when called from policies

  2. **Updated RLS Policies**
     - Replace recursive subqueries with helper function calls
     - Maintain same security model without recursion
     - Ensure users can only access data from their ward

  3. **Security**
     - Functions are SECURITY DEFINER but limited to authenticated users
     - Policies maintain same access control as before
     - No privilege escalation or security holes introduced
*/

-- Drop existing helper functions if they exist
DROP FUNCTION IF EXISTS public.get_current_user_ward_id();
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Create helper function to get current user's ward_id
CREATE OR REPLACE FUNCTION public.get_current_user_ward_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (SELECT ward_id FROM public.users WHERE id = auth.uid());
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_ward_id() TO authenticated;

-- Create helper function to get current user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.user_role
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN (SELECT role FROM public.users WHERE id = auth.uid());
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- Drop existing problematic policies on users table
DROP POLICY IF EXISTS "Users can read ward members" ON public.users;
DROP POLICY IF EXISTS "Ward admins can manage users" ON public.users;

-- Create new non-recursive policies for users table
CREATE POLICY "Users can read ward members"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (ward_id = public.get_current_user_ward_id());

CREATE POLICY "Ward admins can manage users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    ward_id = public.get_current_user_ward_id() 
    AND public.get_current_user_role() = 'admin'::user_role
  )
  WITH CHECK (
    ward_id = public.get_current_user_ward_id() 
    AND public.get_current_user_role() = 'admin'::user_role
  );

-- Drop existing problematic policies on bulletins table
DROP POLICY IF EXISTS "Authenticated users can read passcode/auth bulletins in their w" ON public.bulletins;
DROP POLICY IF EXISTS "Editors can manage bulletins in their ward" ON public.bulletins;

-- Create new non-recursive policies for bulletins table
CREATE POLICY "Authenticated users can read bulletins in their ward"
  ON public.bulletins
  FOR SELECT
  TO authenticated
  USING (ward_id = public.get_current_user_ward_id());

CREATE POLICY "Editors can manage bulletins in their ward"
  ON public.bulletins
  FOR ALL
  TO authenticated
  USING (
    ward_id = public.get_current_user_ward_id() 
    AND public.get_current_user_role() IN ('admin'::user_role, 'editor'::user_role)
  )
  WITH CHECK (
    ward_id = public.get_current_user_ward_id() 
    AND public.get_current_user_role() IN ('admin'::user_role, 'editor'::user_role)
  );

-- Drop existing problematic policies on tokens table
DROP POLICY IF EXISTS "Ward members can read tokens based on visibility" ON public.tokens;
DROP POLICY IF EXISTS "Admins and editors can manage tokens in their ward" ON public.tokens;

-- Create new non-recursive policies for tokens table
CREATE POLICY "Ward members can read tokens based on visibility"
  ON public.tokens
  FOR SELECT
  TO authenticated
  USING (ward_id = public.get_current_user_ward_id());

CREATE POLICY "Admins and editors can manage tokens in their ward"
  ON public.tokens
  FOR ALL
  TO authenticated
  USING (
    ward_id = public.get_current_user_ward_id() 
    AND public.get_current_user_role() IN ('admin'::user_role, 'editor'::user_role)
  )
  WITH CHECK (
    ward_id = public.get_current_user_ward_id() 
    AND public.get_current_user_role() IN ('admin'::user_role, 'editor'::user_role)
  );

-- Drop existing problematic policies on agenda_items table
DROP POLICY IF EXISTS "Agenda items follow bulletin visibility" ON public.agenda_items;
DROP POLICY IF EXISTS "Editors can manage agenda items in their ward" ON public.agenda_items;

-- Create new non-recursive policies for agenda_items table
CREATE POLICY "Agenda items follow bulletin visibility"
  ON public.agenda_items
  FOR SELECT
  TO anon, authenticated
  USING (
    (visibility = 'public'::visibility AND bulletin_id IN (
      SELECT id FROM public.bulletins WHERE view_permission = 'public'::visibility
    ))
    OR 
    (auth.uid() IS NOT NULL AND bulletin_id IN (
      SELECT id FROM public.bulletins WHERE ward_id = public.get_current_user_ward_id()
    ))
  );

CREATE POLICY "Editors can manage agenda items in their ward"
  ON public.agenda_items
  FOR ALL
  TO authenticated
  USING (
    bulletin_id IN (
      SELECT id FROM public.bulletins 
      WHERE ward_id = public.get_current_user_ward_id()
    )
    AND public.get_current_user_role() IN ('admin'::user_role, 'editor'::user_role)
  )
  WITH CHECK (
    bulletin_id IN (
      SELECT id FROM public.bulletins 
      WHERE ward_id = public.get_current_user_ward_id()
    )
    AND public.get_current_user_role() IN ('admin'::user_role, 'editor'::user_role)
  );