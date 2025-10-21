-- Fix Session Token Constraint
-- Date: 2025-01-21
-- Purpose: Allow same device to practice multiple wordlists
-- Issue: session_token had UNIQUE constraint preventing reuse across wordlists

-- Drop the standalone UNIQUE constraint on session_token
-- The composite unique index (wordlist_id, nickname, session_token) is sufficient
ALTER TABLE student_sessions DROP CONSTRAINT IF EXISTS student_sessions_session_token_key;

-- Drop the standalone index if it exists
DROP INDEX IF EXISTS idx_session_token;

-- The composite unique index already exists and is what we want:
-- CREATE UNIQUE INDEX idx_wordlist_nickname_token 
--   ON student_sessions(wordlist_id, nickname, session_token);

-- Add a non-unique index for session_token lookups (for performance)
CREATE INDEX IF NOT EXISTS idx_session_token_lookup 
  ON student_sessions(session_token);

-- Update comment to clarify the constraint
COMMENT ON COLUMN student_sessions.session_token IS 'Browser fingerprint hash (64 hex chars) - same device can practice multiple wordlists';
