-- Enable Anonymous Access Migration
-- Date: 2025-01-10
-- Purpose: Remove authentication requirement and enable session-based anonymous access
-- Requirements: 3.1, 3.2, 3.3, 5.1, 5.2

-- Step 1: Drop existing RLS policies that check auth.uid()
DROP POLICY IF EXISTS "Users can view their own wordlists" ON wordlists;
DROP POLICY IF EXISTS "Users can insert their own wordlists" ON wordlists;
DROP POLICY IF EXISTS "Users can update their own wordlists" ON wordlists;
DROP POLICY IF EXISTS "Users can delete their own wordlists" ON wordlists;

-- Step 2: Drop existing index on user_id
DROP INDEX IF EXISTS idx_wordlists_user;

-- Step 3: Rename user_id column to session_id and change type
-- First, drop the foreign key constraint
ALTER TABLE wordlists DROP CONSTRAINT IF EXISTS wordlists_user_id_fkey;

-- Rename the column
ALTER TABLE wordlists RENAME COLUMN user_id TO session_id;

-- Change column type from UUID to TEXT
ALTER TABLE wordlists ALTER COLUMN session_id TYPE TEXT USING session_id::TEXT;

-- Ensure column is NOT NULL
ALTER TABLE wordlists ALTER COLUMN session_id SET NOT NULL;

-- Step 4: Create new index on session_id
CREATE INDEX idx_wordlists_session ON wordlists(session_id, created_at DESC);

-- Step 5: Create new RLS policies for anonymous access with session-based filtering
-- These policies allow all operations but rely on Edge Functions to filter by session_id
CREATE POLICY "Sessions can view their own wordlists"
  ON wordlists FOR SELECT
  USING (true);

CREATE POLICY "Sessions can insert their own wordlists"
  ON wordlists FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sessions can update their own wordlists"
  ON wordlists FOR UPDATE
  USING (true);

CREATE POLICY "Sessions can delete their own wordlists"
  ON wordlists FOR DELETE
  USING (true);

-- Add comment explaining the session-based approach
COMMENT ON COLUMN wordlists.session_id IS 'Client-generated session ID (UUID stored as TEXT) for anonymous user identification';
COMMENT ON TABLE wordlists IS 'Wordlists with session-based anonymous access - Edge Functions enforce session_id filtering';
