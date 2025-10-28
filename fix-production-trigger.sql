-- Emergency Production Fix
-- Run this directly in Supabase SQL Editor
-- This will remove the problematic trigger and materialized view

BEGIN;

-- Drop the trigger
DROP TRIGGER IF EXISTS refresh_mistake_summary ON practice_mistakes CASCADE;

-- Drop the function
DROP FUNCTION IF EXISTS refresh_mistake_summary_trigger() CASCADE;

-- Drop the materialized view
DROP MATERIALIZED VIEW IF EXISTS wordlist_mistake_summary CASCADE;

-- Ensure permissions are correct
GRANT INSERT ON practice_mistakes TO anon;
GRANT SELECT ON practice_mistakes TO anon;
GRANT SELECT ON student_sessions TO anon;

COMMIT;
