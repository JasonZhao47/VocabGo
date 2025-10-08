# Deployment Guide

This guide walks through deploying the VocabGo backend infrastructure to Supabase.

## Prerequisites

1. **Supabase Account**: Sign up at https://supabase.com
2. **Supabase CLI**: Install globally
   ```bash
   npm install -g supabase
   ```
3. **Project Created**: Create a new project in Supabase Dashboard

## Step 1: Link Your Project

```bash
# Login to Supabase
supabase login

# Link to your project (get project-ref from dashboard URL)
supabase link --project-ref your-project-ref
```

## Step 2: Deploy Database Schema

```bash
# Push migrations to production
supabase db push

# Verify migrations were applied
supabase db diff
```

This will create:
- All database tables (jobs, wordlists, llm_metrics, upload_cooldowns)
- Indexes for query optimization
- Row Level Security policies
- Storage buckets (document-uploads, wordlist-exports)
- Helper functions for queue management and cleanup

## Step 3: Configure Storage Buckets

The storage buckets are created automatically by the migration, but verify in the Supabase Dashboard:

1. Go to **Storage** section
2. Verify `document-uploads` bucket exists
   - Max file size: 50MB
   - Allowed MIME types: PDF, TXT, DOCX, XLSX
3. Verify `wordlist-exports` bucket exists
   - Max file size: 10MB
   - Allowed MIME types: CSV, XLSX

## Step 4: Set Up Cron Jobs for Cleanup

In Supabase Dashboard → Database → Cron Jobs, add:

### Cleanup Old Uploads (runs hourly)
```sql
SELECT cron.schedule(
  'cleanup-uploads',
  '0 * * * *',
  'SELECT cleanup_old_uploads()'
);
```

### Cleanup Old Exports (runs every 15 minutes)
```sql
SELECT cron.schedule(
  'cleanup-exports',
  '*/15 * * * *',
  'SELECT cleanup_old_exports()'
);
```

### Cleanup Expired Cooldowns (runs hourly)
```sql
SELECT cron.schedule(
  'cleanup-cooldowns',
  '0 * * * *',
  'SELECT cleanup_expired_cooldowns()'
);
```

## Step 5: Configure Environment Variables

### Frontend Environment Variables

Create `.env.local` in project root:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from:
- Supabase Dashboard → Settings → API

### Edge Function Environment Variables

These will be set when deploying Edge Functions (Task 7):

```bash
GLM_API_KEY=your-glm-api-key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
GLM_MODEL=glm-4-flash
MAX_CONCURRENT_UPLOADS=5
UPLOAD_COOLDOWN_MS=60000
MAX_FILE_SIZE_MB=50
MAX_WORDS_PER_DOCUMENT=40
FILE_RETENTION_HOURS=24
```

## Step 6: Verify Deployment

### Check Tables
```sql
-- Verify all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('jobs', 'wordlists', 'llm_metrics', 'upload_cooldowns');
```

### Check RLS Policies
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('jobs', 'wordlists', 'llm_metrics', 'upload_cooldowns');
```

### Check Storage Buckets
```sql
-- Verify buckets exist
SELECT id, name, public, file_size_limit 
FROM storage.buckets 
WHERE id IN ('document-uploads', 'wordlist-exports');
```

### Check Functions
```sql
-- Verify helper functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN (
  'update_queue_positions',
  'get_active_job_count',
  'cleanup_expired_cooldowns',
  'cleanup_old_uploads',
  'cleanup_old_exports'
);
```

## Step 7: Test the Setup

### Test Database Access
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
)

// Test query (should return empty array for new user)
const { data, error } = await supabase
  .from('jobs')
  .select('*')
  
console.log('Jobs:', data)
```

### Test Storage Access
```typescript
// Test file upload
const file = new File(['test'], 'test.txt', { type: 'text/plain' })
const { data, error } = await supabase.storage
  .from('document-uploads')
  .upload(`${userId}/test.txt`, file)
  
console.log('Upload:', data)
```

## Rollback Procedure

If you need to rollback migrations:

```bash
# View migration history
supabase migration list

# Rollback to specific migration
supabase db reset --version 20250108000000
```

## Monitoring

### Key Metrics to Monitor

1. **Active Jobs**: `SELECT COUNT(*) FROM jobs WHERE status = 'processing'`
2. **Queue Depth**: `SELECT COUNT(*) FROM jobs WHERE status = 'queued'`
3. **Failed Jobs**: `SELECT COUNT(*) FROM jobs WHERE status = 'failed' AND created_at > NOW() - INTERVAL '24 hours'`
4. **Storage Usage**: Check in Supabase Dashboard → Storage
5. **LLM Costs**: Query `llm_metrics` table for token usage

### Set Up Alerts

In Supabase Dashboard → Database → Webhooks, create alerts for:
- Queue depth > 20
- Failed jobs > 10 in 1 hour
- Storage usage > 80%

## Troubleshooting

### Migration Fails
- Check for syntax errors in SQL files
- Verify you have proper permissions
- Check Supabase logs in Dashboard

### RLS Policies Not Working
- Verify user is authenticated
- Check policy conditions match your use case
- Test with service role key (bypasses RLS)

### Storage Upload Fails
- Verify MIME type is allowed
- Check file size is under limit
- Verify bucket exists and RLS policies are correct

## Next Steps

After infrastructure is deployed:
1. Implement document parser service (Task 2)
2. Implement LLM service (Task 3)
3. Implement AI agents (Task 4)
4. Deploy Edge Functions (Task 7)
