-- Verification Script for Backend Infrastructure
-- Run this to verify all components are properly set up

-- ============================================
-- 1. Verify Tables Exist
-- ============================================
SELECT 
  'Tables Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('jobs', 'wordlists', 'llm_metrics', 'upload_cooldowns');

-- ============================================
-- 2. Verify RLS is Enabled
-- ============================================
SELECT 
  'RLS Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('jobs', 'wordlists', 'llm_metrics', 'upload_cooldowns')
AND rowsecurity = true;

-- ============================================
-- 3. Verify Indexes Exist
-- ============================================
SELECT 
  'Indexes Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname IN (
  'idx_jobs_user_status',
  'idx_jobs_status_created',
  'idx_jobs_queue_position',
  'idx_wordlists_user',
  'idx_llm_metrics_job',
  'idx_upload_cooldowns_until'
);

-- ============================================
-- 4. Verify Storage Buckets Exist
-- ============================================
SELECT 
  'Storage Buckets Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM storage.buckets 
WHERE id IN ('document-uploads', 'wordlist-exports');

-- ============================================
-- 5. Verify Helper Functions Exist
-- ============================================
SELECT 
  'Functions Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 5 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'update_queue_positions',
  'get_active_job_count',
  'cleanup_expired_cooldowns',
  'cleanup_old_uploads',
  'cleanup_old_exports'
);

-- ============================================
-- 6. Verify RLS Policies Exist
-- ============================================
SELECT 
  'RLS Policies Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 13 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- 7. Verify Triggers Exist
-- ============================================
SELECT 
  'Triggers Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 1 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND trigger_name = 'trigger_update_queue_positions';

-- ============================================
-- 8. Detailed Table Structure Verification
-- ============================================

-- Jobs table columns
SELECT 
  'jobs table columns' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 13 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'jobs';

-- Wordlists table columns
SELECT 
  'wordlists table columns' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'wordlists';

-- LLM metrics table columns
SELECT 
  'llm_metrics table columns' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 9 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'llm_metrics';

-- Upload cooldowns table columns
SELECT 
  'upload_cooldowns table columns' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'upload_cooldowns';

-- ============================================
-- 9. Verify Storage Bucket Configuration
-- ============================================
SELECT 
  id as bucket_name,
  file_size_limit / 1024 / 1024 as max_size_mb,
  public as is_public,
  CASE 
    WHEN id = 'document-uploads' AND file_size_limit = 52428800 THEN '✅ PASS'
    WHEN id = 'wordlist-exports' AND file_size_limit = 10485760 THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM storage.buckets 
WHERE id IN ('document-uploads', 'wordlist-exports');

-- ============================================
-- Summary
-- ============================================
SELECT 
  '=== VERIFICATION COMPLETE ===' as message,
  'All checks should show ✅ PASS' as note;
