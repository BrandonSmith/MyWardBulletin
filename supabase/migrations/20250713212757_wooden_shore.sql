/*
  # Fix RLS policies for tokens table

  1. Security Updates
    - Drop existing restrictive policies that prevent users from managing their own tokens
    - Add new policies that allow authenticated users to create and manage their own tokens
    - Ensure users can insert, update, and select their own token data

  2. Policy Changes
    - Allow authenticated users to insert tokens they create
    - Allow authenticated users to update tokens they created
    - Allow authenticated users to read tokens they created
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Admins and editors can manage tokens in their ward" ON tokens;
DROP POLICY IF EXISTS "Ward members can read tokens based on visibility" ON tokens;

-- Create new policies that allow users to manage their own tokens
CREATE POLICY "Users can create their own tokens"
  ON tokens
  FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can read their own tokens"
  ON tokens
  FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Users can update their own tokens"
  ON tokens
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can delete their own tokens"
  ON tokens
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());