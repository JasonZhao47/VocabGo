-- Student Tracking & Sharing System Migration
-- Date: 2025-01-17
-- Purpose: Enable teachers to share wordlists and track student practice mistakes
-- Requirements: FR1, FR2, FR3, NFR2

-- ============================================================================
-- PART 1: Add sharing columns to wordlists table
-- ============================================================================

-- Add sharing-related columns to existing wordlists table
ALTER TABLE wordlists ADD COLUMN IF NOT EXISTS share_token VARCHAR(48) UNIQUE;
ALTER TABLE wordlists ADD COLUMN IF NOT EXISTS is_shared BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE wordlists ADD COLUMN IF NOT EXISTS share_settings JSONB DEFAULT '{"anonymous_mode": false}'::jsonb;
ALTER TABLE wordlists ADD COLUMN IF NOT EXISTS shared_at TIMESTAMPTZ;

-- Create index for share token lookup (partial index for performance)
CREATE INDEX IF NOT EXISTS idx_wordlists_share_token 
  ON wordlists(share_token) 
  WHERE is_shared = TRUE;

-- Add comments for documentation
COMMENT ON COLUMN wordlists.share_token IS 'Cryptographically secure token (48 hex chars) for sharing wordlist with students';
COMMENT ON COLUMN wordlists.is_shared IS 'Whether this wordlist is currently shared and accessible via share link';
COMMENT ON COLUMN wordlists.share_settings IS 'JSON settings for sharing (e.g., anonymous_mode)';
COMMENT ON COLUMN wordlists.shared_at IS 'Timestamp when sharing was first enabled';

-- ============================================================================
-- PART 2: Create student_sessions table
-- ============================================================================

-- Student sessions table for lightweight identity tracking
CREATE TABLE student_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wordlist_id UUID NOT NULL REFERENCES wordlists(id) ON DELETE CASCADE,
  nickname VARCHAR(20) NOT NULL,
  session_token VARCHAR(64) NOT NULL UNIQUE,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_active_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_nickname_length CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 20),
  CONSTRAINT valid_session_token CHECK (char_length(session_token) = 64),
  CONSTRAINT valid_device_info CHECK (device_info IS NULL OR jsonb_typeof(device_info) = 'object')
);

-- Create indexes for performance
CREATE INDEX idx_wordlist_sessions 
  ON student_sessions(wordlist_id, created_at DESC);

CREATE INDEX idx_session_token 
  ON student_sessions(session_token);

-- Unique constraint to prevent duplicate sessions (same nickname + device on same wordlist)
CREATE UNIQUE INDEX idx_wordlist_nickname_token 
  ON student_sessions(wordlist_id, nickname, session_token);

-- Add comments for documentation
COMMENT ON TABLE student_sessions IS 'Lightweight student identity tracking without authentication - uses browser fingerprint';
COMMENT ON COLUMN student_sessions.nickname IS 'Student-provided nickname (2-20 chars, Unicode supported)';
COMMENT ON COLUMN student_sessions.session_token IS 'Browser fingerprint hash (64 hex chars) for session persistence';
COMMENT ON COLUMN student_sessions.device_info IS 'JSON object with userAgent, screen resolution, timezone for fingerprinting';
COMMENT ON COLUMN student_sessions.last_active_at IS 'Last time student practiced or made a mistake';

-- ============================================================================
-- PART 3: Create practice_mistakes table
-- ============================================================================

-- Practice mistakes tracking table
CREATE TABLE practice_mistakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_session_id UUID NOT NULL REFERENCES student_sessions(id) ON DELETE CASCADE,
  wordlist_id UUID NOT NULL REFERENCES wordlists(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  translation VARCHAR(100) NOT NULL,
  question_type VARCHAR(20) NOT NULL,
  mistake_count INTEGER DEFAULT 1 NOT NULL,
  first_mistake_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  last_mistake_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_question_type CHECK (question_type IN ('multiple_choice', 'fill_blank', 'matching')),
  CONSTRAINT valid_mistake_count CHECK (mistake_count > 0)
);

-- Create indexes for performance
CREATE INDEX idx_session_mistakes 
  ON practice_mistakes(student_session_id, last_mistake_at DESC);

CREATE INDEX idx_wordlist_mistakes 
  ON practice_mistakes(wordlist_id, mistake_count DESC);

CREATE INDEX idx_word_mistakes 
  ON practice_mistakes(wordlist_id, word);

-- Add comments for documentation
COMMENT ON TABLE practice_mistakes IS 'Tracks individual student mistakes for each word in practice sessions';
COMMENT ON COLUMN practice_mistakes.word IS 'The English word that was answered incorrectly';
COMMENT ON COLUMN practice_mistakes.translation IS 'The Mandarin translation of the word';
COMMENT ON COLUMN practice_mistakes.question_type IS 'Type of question where mistake occurred';
COMMENT ON COLUMN practice_mistakes.mistake_count IS 'Number of times this student made this mistake (incremented on repeat errors)';

-- ============================================================================
-- PART 4: Create materialized view for fast aggregation
-- ============================================================================

-- Materialized view for efficient mistake aggregation queries
CREATE MATERIALIZED VIEW wordlist_mistake_summary AS
SELECT 
  wordlist_id,
  word,
  translation,
  COUNT(DISTINCT student_session_id) as student_count,
  SUM(mistake_count) as total_mistakes,
  AVG(mistake_count) as avg_mistakes_per_student,
  MAX(last_mistake_at) as last_occurred
FROM practice_mistakes
GROUP BY wordlist_id, word, translation
ORDER BY total_mistakes DESC;

-- Create index on materialized view for fast wordlist lookups
CREATE INDEX idx_mistake_summary_wordlist 
  ON wordlist_mistake_summary(wordlist_id, total_mistakes DESC);

-- Add comment for documentation
COMMENT ON MATERIALIZED VIEW wordlist_mistake_summary IS 'Aggregated mistake statistics per word for teacher dashboard - refreshed on mistake insert/update';

-- ============================================================================
-- PART 5: Create trigger to refresh materialized view
-- ============================================================================

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_mistake_summary()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY wordlist_mistake_summary;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to refresh view after mistakes are recorded
CREATE TRIGGER refresh_mistake_summary_trigger
AFTER INSERT OR UPDATE ON practice_mistakes
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_mistake_summary();

-- ============================================================================
-- PART 6: Enable Row Level Security
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE student_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_mistakes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_sessions
-- Allow anyone to read sessions for shared wordlists (Edge Functions will filter)
CREATE POLICY "Anyone can view student sessions for shared wordlists"
  ON student_sessions FOR SELECT
  USING (true);

-- Allow anyone to create student sessions (Edge Functions validate share token)
CREATE POLICY "Anyone can create student sessions"
  ON student_sessions FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update student sessions (Edge Functions validate session token)
CREATE POLICY "Anyone can update student sessions"
  ON student_sessions FOR UPDATE
  USING (true);

-- RLS Policies for practice_mistakes
-- Allow anyone to read mistakes (Edge Functions will filter by ownership)
CREATE POLICY "Anyone can view practice mistakes"
  ON practice_mistakes FOR SELECT
  USING (true);

-- Allow anyone to create mistakes (Edge Functions validate session token)
CREATE POLICY "Anyone can create practice mistakes"
  ON practice_mistakes FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update mistakes (Edge Functions validate session token)
CREATE POLICY "Anyone can update practice mistakes"
  ON practice_mistakes FOR UPDATE
  USING (true);

-- ============================================================================
-- PART 7: Data retention function (90-day cleanup)
-- ============================================================================

-- Function to clean up old student sessions and mistakes (90-day retention)
CREATE OR REPLACE FUNCTION cleanup_old_student_data()
RETURNS void AS $$
BEGIN
  -- Delete student sessions older than 90 days with no recent activity
  DELETE FROM student_sessions
  WHERE last_active_at < NOW() - INTERVAL '90 days';
  
  -- Orphaned mistakes will be automatically deleted via CASCADE
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION cleanup_old_student_data() IS 'Cleanup function to delete student sessions and mistakes older than 90 days - should be run via scheduled job';

