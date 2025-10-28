-- Fix Materialized View Permissions
-- Date: 2025-01-27
-- Purpose: Remove materialized view and its trigger to fix permission issues

-- Drop the trigger first (CASCADE will handle dependencies)
DROP TRIGGER IF EXISTS refresh_mistake_summary ON practice_mistakes CASCADE;
DROP FUNCTION IF EXISTS refresh_mistake_summary_trigger() CASCADE;

-- Drop the materialized view (CASCADE will drop dependent objects)
DROP MATERIALIZED VIEW IF EXISTS wordlist_mistake_summary CASCADE;

-- The practice_mistakes table works fine without the materialized view
-- If we need aggregated statistics, we can query directly from practice_mistakes

-- Ensure anon users can insert into practice_mistakes
GRANT INSERT ON practice_mistakes TO anon;
GRANT SELECT ON practice_mistakes TO anon;

-- Ensure anon users can read from student_sessions (needed for mistake recording)
GRANT SELECT ON student_sessions TO anon;
