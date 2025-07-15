/*
  # Add user name and phone to recordings table

  1. Schema Changes
    - Add `user_name` column to store the user's full name
    - Add `user_phone` column to store the user's phone number
    - Both fields are optional (nullable) to handle cases where user profile is incomplete

  2. Security
    - Existing RLS policies will continue to work
    - No additional security changes needed as data access is still user-scoped

  3. Data Integrity
    - Fields are added as nullable to avoid breaking existing records
    - Future records should populate these fields from user profile data
*/

-- Add user name and phone columns to recordings table
ALTER TABLE recordings 
ADD COLUMN user_name text,
ADD COLUMN user_phone text;

-- Add helpful comment
COMMENT ON COLUMN recordings.user_name IS 'User full name captured at time of emergency for contact purposes';
COMMENT ON COLUMN recordings.user_phone IS 'User phone number captured at time of emergency for contact purposes';