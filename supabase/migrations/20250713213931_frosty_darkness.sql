/*
  # Fix bulletins RLS policy for user bulletin management

  1. Policy Changes
    - Update the "Editors can manage bulletins in their ward" policy to allow any authenticated user to manage their own bulletins
    - Remove ward-based restrictions and role-based restrictions for bulletin management
    - Keep the policy name for consistency but change the logic to be user-based

  2. Security
    - Users can only create, update, and delete bulletins where they are the creator (created_by = auth.uid())
    - This ensures users can only manage their own bulletins
    - Public read access remains unchanged for bulletins with public visibility
*/

-- Update the existing policy to allow users to manage their own bulletins
ALTER POLICY "Editors can manage bulletins in their ward" ON public.bulletins
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- Also update the policy name to better reflect its new purpose
ALTER POLICY "Editors can manage bulletins in their ward" ON public.bulletins
RENAME TO "Users can manage their own bulletins";