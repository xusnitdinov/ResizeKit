/*
# Create resize_history table for cloud save feature

1. Purpose
- Stores resize history for authenticated users who want to save their work
- Guest users can use the app fully without signing in
- Optional feature: "Save to Cloud" toggle appears when logged in

2. New Tables
- `resize_history`
- `id` (uuid, primary key)
- `user_id` (uuid, references auth.users, defaults to auth.uid())
- `original_filename` (text, name of uploaded file)
- `original_width` (integer)
- `original_height` (integer)
- `platforms_generated` (text array, e.g., ["instagram_post", "twitter_header"])
- `created_at` (timestamptz)

3. Security
- Enable RLS on resize_history
- Owner-scoped CRUD: authenticated users only access their own rows
- No anon access - guests don't have cloud save
*/

CREATE TABLE IF NOT EXISTS resize_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename text NOT NULL,
  original_width integer NOT NULL,
  original_height integer NOT NULL,
  platforms_generated text[] NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE resize_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_history" ON resize_history;
CREATE POLICY "select_own_history" ON resize_history FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_history" ON resize_history;
CREATE POLICY "insert_own_history" ON resize_history FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_history" ON resize_history;
CREATE POLICY "delete_own_history" ON resize_history FOR DELETE
  TO authenticated USING (auth.uid() = user_id);