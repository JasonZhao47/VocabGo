-- Practice Questions Feature Schema
-- This migration creates tables for practice question generation and session management

-- Practice Sets Table
-- Stores generated practice question sets for wordlists
CREATE TABLE practice_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wordlist_id UUID REFERENCES wordlists(id) ON DELETE CASCADE NOT NULL,
  questions JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  share_url TEXT UNIQUE,
  is_shared BOOLEAN DEFAULT FALSE NOT NULL,
  
  CONSTRAINT valid_questions CHECK (jsonb_typeof(questions) = 'object')
);

-- Practice Sessions Table
-- Stores individual practice session results and progress
CREATE TABLE practice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_set_id UUID REFERENCES practice_sets(id) ON DELETE CASCADE NOT NULL,
  session_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  timer_duration INTEGER,
  answers JSONB NOT NULL,
  score DECIMAL(5,2),
  completed BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  CONSTRAINT valid_timer_duration CHECK (timer_duration IS NULL OR timer_duration > 0),
  CONSTRAINT valid_score CHECK (score IS NULL OR (score >= 0 AND score <= 100)),
  CONSTRAINT valid_answers CHECK (jsonb_typeof(answers) = 'object')
);

-- Performance Indexes
CREATE INDEX idx_practice_sets_wordlist ON practice_sets(wordlist_id);
CREATE INDEX idx_practice_sets_share_url ON practice_sets(share_url) WHERE share_url IS NOT NULL;
CREATE INDEX idx_practice_sets_created_at ON practice_sets(created_at DESC);

CREATE INDEX idx_practice_sessions_set ON practice_sessions(practice_set_id);
CREATE INDEX idx_practice_sessions_session_id ON practice_sessions(session_id);
CREATE INDEX idx_practice_sessions_created_at ON practice_sessions(created_at DESC);
CREATE INDEX idx_practice_sessions_completed ON practice_sessions(completed, created_at DESC);

-- Enable Row Level Security
ALTER TABLE practice_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for practice_sets
-- Allow anonymous users to read their own practice sets
CREATE POLICY "Users can view practice sets for their wordlists"
  ON practice_sets FOR SELECT
  USING (
    wordlist_id IN (
      SELECT id FROM wordlists WHERE session_id = current_setting('request.headers', true)::json->>'x-session-id'
    )
  );

-- Allow anonymous users to create practice sets for their wordlists
CREATE POLICY "Users can create practice sets for their wordlists"
  ON practice_sets FOR INSERT
  WITH CHECK (
    wordlist_id IN (
      SELECT id FROM wordlists WHERE session_id = current_setting('request.headers', true)::json->>'x-session-id'
    )
  );

-- Allow anonymous users to update their practice sets
CREATE POLICY "Users can update their practice sets"
  ON practice_sets FOR UPDATE
  USING (
    wordlist_id IN (
      SELECT id FROM wordlists WHERE session_id = current_setting('request.headers', true)::json->>'x-session-id'
    )
  );

-- Allow anonymous users to delete their practice sets
CREATE POLICY "Users can delete their practice sets"
  ON practice_sets FOR DELETE
  USING (
    wordlist_id IN (
      SELECT id FROM wordlists WHERE session_id = current_setting('request.headers', true)::json->>'x-session-id'
    )
  );

-- Allow public access to shared practice sets
CREATE POLICY "Anyone can view shared practice sets"
  ON practice_sets FOR SELECT
  USING (is_shared = true AND share_url IS NOT NULL);

-- RLS Policies for practice_sessions
-- Allow users to view their own practice sessions
CREATE POLICY "Users can view their practice sessions"
  ON practice_sessions FOR SELECT
  USING (
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
  );

-- Allow users to create practice sessions
CREATE POLICY "Users can create practice sessions"
  ON practice_sessions FOR INSERT
  WITH CHECK (
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
  );

-- Allow users to update their practice sessions
CREATE POLICY "Users can update their practice sessions"
  ON practice_sessions FOR UPDATE
  USING (
    session_id = current_setting('request.headers', true)::json->>'x-session-id'
  );

-- Comments for documentation
COMMENT ON TABLE practice_sets IS 'Stores generated practice question sets linked to wordlists';
COMMENT ON TABLE practice_sessions IS 'Stores individual practice session results and progress tracking';
COMMENT ON COLUMN practice_sets.questions IS 'JSONB object containing all generated questions for matching, fill-blank, and multiple-choice types';
COMMENT ON COLUMN practice_sets.share_url IS 'Unique URL slug for sharing practice sets publicly';
COMMENT ON COLUMN practice_sessions.session_id IS 'Client-generated session ID for anonymous user tracking';
COMMENT ON COLUMN practice_sessions.timer_duration IS 'Timer duration in minutes (optional)';
COMMENT ON COLUMN practice_sessions.score IS 'Final score as percentage (0-100)';
