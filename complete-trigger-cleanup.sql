-- Complete Cleanup of Materialized View and All Related Objects
-- Run this in Supabase SQL Editor

BEGIN;

-- Drop all triggers on practice_mistakes that might reference the view
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'practice_mistakes'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.trigger_name) || ' ON practice_mistakes CASCADE';
        RAISE NOTICE 'Dropped trigger: %', r.trigger_name;
    END LOOP;
END $$;

-- Drop all functions that reference wordlist_mistake_summary
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT routine_name, routine_schema
        FROM information_schema.routines
        WHERE routine_definition LIKE '%wordlist_mistake_summary%'
          AND routine_schema = 'public'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(r.routine_schema) || '.' || quote_ident(r.routine_name) || ' CASCADE';
        RAISE NOTICE 'Dropped function: %.%', r.routine_schema, r.routine_name;
    END LOOP;
END $$;

-- Drop the materialized view
DROP MATERIALIZED VIEW IF EXISTS wordlist_mistake_summary CASCADE;

-- Verify permissions on practice_mistakes
GRANT INSERT, SELECT ON practice_mistakes TO anon;
GRANT SELECT ON student_sessions TO anon;

-- Verify the cleanup
SELECT 'Triggers on practice_mistakes:' AS check_type, COUNT(*)::text AS count
FROM information_schema.triggers
WHERE event_object_table = 'practice_mistakes'
UNION ALL
SELECT 'Functions referencing view:', COUNT(*)::text
FROM information_schema.routines
WHERE routine_definition LIKE '%wordlist_mistake_summary%'
  AND routine_schema = 'public'
UNION ALL
SELECT 'Materialized view exists:', COUNT(*)::text
FROM pg_matviews
WHERE matviewname = 'wordlist_mistake_summary';

COMMIT;
