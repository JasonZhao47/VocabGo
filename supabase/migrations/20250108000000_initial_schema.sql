-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Jobs table for tracking processing status
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID NOT NULL,
  filename TEXT NOT NULL,
  document_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  stage TEXT CHECK (stage IN ('cleaning', 'extracting', 'translating')),
  queue_position INTEGER,
  retry_count INTEGER DEFAULT 0,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Wordlists table for saved results
CREATE TABLE wordlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  document_type TEXT NOT NULL,
  word_count INTEGER NOT NULL CHECK (word_count <= 40 AND word_count >= 0),
  words JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- LLM metrics table for observability
CREATE TABLE llm_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('cleaner', 'extractor', 'translator')),
  prompt_tokens INTEGER NOT NULL CHECK (prompt_tokens >= 0),
  completion_tokens INTEGER NOT NULL CHECK (completion_tokens >= 0),
  total_tokens INTEGER NOT NULL CHECK (total_tokens >= 0),
  latency_ms INTEGER NOT NULL CHECK (latency_ms >= 0),
  model TEXT NOT NULL,
  confidence NUMERIC(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Upload cooldowns table for rate limiting
CREATE TABLE upload_cooldowns (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  last_upload_at TIMESTAMPTZ NOT NULL,
  upload_count INTEGER DEFAULT 1 CHECK (upload_count >= 0),
  cooldown_until TIMESTAMPTZ NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_jobs_user_status ON jobs(user_id, status);
CREATE INDEX idx_jobs_status_created ON jobs(status, created_at);
CREATE INDEX idx_jobs_queue_position ON jobs(queue_position) WHERE status = 'queued';
CREATE INDEX idx_wordlists_user ON wordlists(user_id, created_at DESC);
CREATE INDEX idx_llm_metrics_job ON llm_metrics(job_id);
CREATE INDEX idx_upload_cooldowns_until ON upload_cooldowns(cooldown_until);

-- Enable Row Level Security on all tables
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE wordlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE llm_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_cooldowns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for jobs table
CREATE POLICY "Users can view their own jobs"
  ON jobs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jobs"
  ON jobs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for wordlists table
CREATE POLICY "Users can view their own wordlists"
  ON wordlists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wordlists"
  ON wordlists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wordlists"
  ON wordlists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wordlists"
  ON wordlists FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for llm_metrics table
-- Only allow service role to access metrics (for admin/monitoring)
CREATE POLICY "Service role can manage llm_metrics"
  ON llm_metrics FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- RLS Policies for upload_cooldowns table
CREATE POLICY "Users can view their own cooldown"
  ON upload_cooldowns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cooldown"
  ON upload_cooldowns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cooldown"
  ON upload_cooldowns FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically update queue positions
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate queue positions for all queued jobs
  WITH ranked_jobs AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_position
    FROM jobs
    WHERE status = 'queued'
  )
  UPDATE jobs
  SET queue_position = ranked_jobs.new_position
  FROM ranked_jobs
  WHERE jobs.id = ranked_jobs.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update queue positions when job status changes
-- Note: Separate triggers for INSERT and UPDATE to avoid OLD reference error
CREATE TRIGGER trigger_update_queue_positions_insert
AFTER INSERT ON jobs
FOR EACH ROW
WHEN (NEW.status = 'queued')
EXECUTE FUNCTION update_queue_positions();

CREATE TRIGGER trigger_update_queue_positions_update
AFTER UPDATE OF status ON jobs
FOR EACH ROW
WHEN (NEW.status = 'queued' OR OLD.status = 'queued')
EXECUTE FUNCTION update_queue_positions();

-- Function to get active job count
CREATE OR REPLACE FUNCTION get_active_job_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM jobs WHERE status = 'processing');
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old cooldowns
CREATE OR REPLACE FUNCTION cleanup_expired_cooldowns()
RETURNS void AS $$
BEGIN
  DELETE FROM upload_cooldowns
  WHERE cooldown_until < NOW();
END;
$$ LANGUAGE plpgsql;
