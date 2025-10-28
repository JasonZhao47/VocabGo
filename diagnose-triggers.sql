-- Diagnostic: Check for triggers and functions referencing wordlist_mistake_summary
-- Run this in Supabase SQL Editor to see what's causing the error

-- 1. Check all triggers on practice_mistakes table
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'practice_mistakes'
ORDER BY trigger_name;

-- 2. Check all functions that reference wordlist_mistake_summary
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%wordlist_mistake_summary%'
ORDER BY routine_name;

-- 3. Check if materialized view still exists
SELECT 
  matviewname,
  definition
FROM pg_matviews
WHERE matviewname = 'wordlist_mistake_summary';

-- 4. List all triggers in the database
SELECT 
  t.tgname AS trigger_name,
  c.relname AS table_name,
  p.proname AS function_name
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE NOT t.tgisinternal
ORDER BY c.relname, t.tgname;
