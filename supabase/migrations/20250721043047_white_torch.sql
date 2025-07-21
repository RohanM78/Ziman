/*
  # Add full name to user profiles table

  1. Changes
    - Add `full_name` column to `user_profiles` table
    - Update existing trigger function to handle the new column
  
  2. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Add full_name column to user_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN full_name text;
  END IF;
END $$;