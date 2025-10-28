-- Drop Materialized View Trigger (Production Hotfix)
-- Date: 2025-01-28
-- Purpose: Remove the trigger and materialized view causing production errors

-- Drop the trigger first
DROP TRIGGER IF EXISTS refresh_mistake_summary ON practice_mistakes CASCADE;

-- Drop the function
DROP FUNCTION IF EXISTS refresh_mistake_summary_trigger() CASCADE;

-- Drop the materialized view
DROP MATERIALIZED VIEW IF EXISTS wordlist_mistake_summary CASCADE;

-- Ensure anon users have proper permissions
GRANT INSERT ON practice_mistakes TO anon;
GRANT SELECT ON practice_mistakes TO anon;
GRANT SELECT ON student_sessions TO anon;
