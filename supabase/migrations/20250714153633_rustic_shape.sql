/*
  # Create recordings table for emergency events

  1. New Tables
    - `recordings`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `timestamp` (timestamptz, when emergency was triggered)
      - `file_url` (text, URL to uploaded recording file)
      - `location` (jsonb, GPS coordinates if available)
      - `device_info` (jsonb, platform and device information)
      - `emergency_contacts` (jsonb, array of emergency contacts and notification status)
      - `status` (text, emergency status: active/completed/cancelled)
      - `created_at` (timestamptz, record creation time)
      - `updated_at` (timestamptz, last update time)

  2. Security
    - Enable RLS on `recordings` table
    - Add policy for authenticated users to manage their own recordings
    - Add policy for authenticated users to insert new recordings
    - Add policy for authenticated users to update their own recordings

  3. Storage
    - Create `recordings` storage bucket for video files
    - Set up RLS policies for storage bucket access
*/

-- Create recordings table
CREATE TABLE IF NOT EXISTS recordings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  timestamp timestamptz NOT NULL,
  file_url text DEFAULT '',
  location jsonb,
  device_info jsonb NOT NULL,
  emergency_contacts jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for recordings table
CREATE POLICY "Users can view their own recordings"
  ON recordings
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings"
  ON recordings
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recordings"
  ON recordings
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_recordings_updated_at
  BEFORE UPDATE ON recordings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for recordings (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('recordings', 'recordings', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for storage bucket
CREATE POLICY "Users can upload their own recordings"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own recordings"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'recordings' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public can view recordings"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'recordings');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS recordings_user_id_idx ON recordings(user_id);
CREATE INDEX IF NOT EXISTS recordings_timestamp_idx ON recordings(timestamp DESC);
CREATE INDEX IF NOT EXISTS recordings_status_idx ON recordings(status);