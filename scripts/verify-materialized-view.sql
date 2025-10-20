-- Verification script for materialized view implementation
-- Task 2: Create materialized view for mistake aggregation
-- Requirements: FR4, NFR1, NFR2

-- ============================================================================
-- 1. Verify materialized view exists
-- ============================================================================
SELECT 
  schemaname,
  matviewname,
  definition
FROM pg_matviews
WHERE matviewname = 'wordlist_mistake_summary';

-- ============================================================================
-- 2. Verify view structure
-- ============================================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'wordlist_mistake_summary'
ORDER BY ordinal_position;

-- ============================================================================
-- 3. Verify index on wordlist_id exists
-- ============================================================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'wordlist_mistake_summary'
AND indexname = 'idx_mistake_summary_wordlist';

-- ============================================================================
-- 4. Verify refresh trigger exists
-- ============================================================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'refresh_mistake_summary_trigger';

-- ============================================================================
-- 5. Verify refresh function exists
-- ============================================================================
SELECT 
  routine_name,
  routine_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'refresh_mistake_summary';

-- ============================================================================
-- 6. Test query performance with EXPLAIN ANALYZE
-- ============================================================================
-- Note: Run this after inserting test data
EXPLAIN ANALYZE
SELECT *
FROM wordlist_mistake_summary
WHERE wordlist_id = '00000000-0000-0000-0000-000000000000'
ORDER BY total_mistakes DESC;

-- ============================================================================
-- 7. Verify aggregation logic
-- ============================================================================
-- Compare materialized view results with raw query
SELECT 
  'Materialized View' as source,
  COUNT(*) as row_count
FROM wordlist_mistake_summary

UNION ALL

SELECT 
  'Raw Aggregation' as source,
  COUNT(*) as row_count
FROM (
  SELECT 
    wordlist_id,
    word,
    translation,
    COUNT(DISTINCT student_session_id) as student_count,
    SUM(mistake_count) as total_mistakes,
    AVG(mistake_count) as avg_mistakes_per_student
  FROM practice_mistakes
  GROUP BY wordlist_id, word, translation
) raw;

-- ============================================================================
-- 8. Check materialized view freshness
-- ============================================================================
SELECT 
  schemaname,
  matviewname,
  hasindexes,
  ispopulated,
  definition
FROM pg_matviews
WHERE matviewname = 'wordlist_mistake_summary';
