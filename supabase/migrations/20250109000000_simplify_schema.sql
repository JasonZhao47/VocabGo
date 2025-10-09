-- Simplification Migration: Remove over-engineered tables
-- Date: 2025-01-09
-- Rationale: MVP doesn't need queue system, metrics tracking, or rate limiting

-- Drop triggers first
DROP TRIGGER IF EXISTS trigger_update_queue_positions_insert ON jobs;
DROP TRIGGER IF EXISTS trigger_update_queue_positions_update ON jobs;
DROP TRIGGER IF EXISTS trigger_update_queue_positions ON jobs;

-- Drop functions
DROP FUNCTION IF EXISTS update_queue_positions();
DROP FUNCTION IF EXISTS get_active_job_count();
DROP FUNCTION IF EXISTS cleanup_expired_cooldowns();

-- Drop unused tables (cascade to remove foreign keys)
DROP TABLE IF EXISTS llm_metrics CASCADE;
DROP TABLE IF EXISTS upload_cooldowns CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Simplify wordlists table (remove job_id foreign key)
ALTER TABLE wordlists DROP COLUMN IF EXISTS job_id;

-- Add comment explaining simplification
COMMENT ON TABLE wordlists IS 'Simplified schema for MVP - stores only saved wordlists without job tracking';

