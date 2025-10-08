# Backend Infrastructure Setup

This document provides an overview of the backend infrastructure for VocabGo's AI wordlist extraction feature.

## Overview

The backend infrastructure consists of:
- **PostgreSQL Database**: 4 tables with RLS policies
- **Storage Buckets**: 2 buckets with auto-cleanup
- **Helper Functions**: Queue management and cleanup utilities
- **Triggers**: Automatic queue position updates

## Architecture Components

### 1. Database Tables

#### jobs
Tracks document processing through the AI pipeline.
- Stores job status, progress, and queue position
- Supports retry logic with retry_count
- Tracks processing stages (cleaning, extracting, translating)

#### wordlists
Stores saved bilingual wordlists.
- JSONB column for flexible word pair storage
- Enforces 40-word maximum constraint
- Links to source job for traceability

#### llm_metrics
Logs LLM API calls for monitoring and cost tracking.
- Tracks token usage per agent type
- Records latency and confidence metrics
- Enables cost analysis and optimization

#### upload_cooldowns
Enforces rate limiting on document uploads.
- Per-user cooldown tracking
- Supports configurable cooldown periods
- Auto-cleanup of expired cooldowns

### 2. Storage Buckets

#### document-uploads
- **Purpose**: Temporary storage for uploaded documents
- **Retention**: 24 hours (auto-cleanup)
- **Max Size**: 50MB per file
- **Allowed Types**: PDF, TXT, DOCX, XLSX
- **Path Structure**: `{user_id}/{file_id}.{ext}`

#### wordlist-exports
- **Purpose**: Generated export files (CSV, XLSX)
- **Retention**: 1 hour (auto-cleanup)
- **Max Size**: 10MB per file
- **Allowed Types**: CSV, XLSX
- **Path Structure**: `{user_id}/{wordlist_id}.{ext}`

### 3. Security (RLS Policies)

All tables have Row Level Security enabled:

- **User Tables** (jobs, wordlists, upload_cooldowns):
  - Users can only access their own records
  - Filtered by `auth.uid() = user_id`

- **Admin Tables** (llm_metrics):
  - Only service role can access
  - Used for monitoring and analytics

- **Storage Buckets**:
  - Users can only access files in their folder
  - Service role can manage all files (for cleanup)

### 4. Helper Functions

#### update_queue_positions()
- **Type**: Trigger function
- **Purpose**: Automatically recalculates queue positions
- **Trigger**: After INSERT or UPDATE on jobs table

#### get_active_job_count()
- **Returns**: INTEGER
- **Purpose**: Returns count of processing jobs
- **Usage**: Enforce global concurrent upload limit (5)

#### cleanup_expired_cooldowns()
- **Returns**: void
- **Purpose**: Deletes expired cooldown records
- **Schedule**: Run hourly via cron

#### cleanup_old_uploads()
- **Returns**: void
- **Purpose**: Deletes files older than 24 hours
- **Schedule**: Run hourly via cron

#### cleanup_old_exports()
- **Returns**: void
- **Purpose**: Deletes files older than 1 hour
- **Schedule**: Run every 15 minutes via cron

## Performance Optimizations

### Indexes
- `idx_jobs_user_status`: Fast user job queries
- `idx_jobs_status_created`: Queue ordering
- `idx_jobs_queue_position`: Queue position lookups
- `idx_wordlists_user`: User wordlist retrieval
- `idx_llm_metrics_job`: Metrics aggregation
- `idx_upload_cooldowns_until`: Cooldown checks

### Constraints
- CHECK constraints for data validation
- Foreign keys with CASCADE for cleanup
- NOT NULL constraints for required fields
- Numeric ranges for progress, tokens, confidence

## Setup Instructions

### Local Development

1. **Start Supabase**:
   ```bash
   ./supabase/setup-local.sh
   ```

2. **Verify Setup**:
   ```bash
   supabase db reset
   ```

3. **Run Verification**:
   ```bash
   psql postgresql://postgres:postgres@localhost:54322/postgres \
     -f supabase/verify-schema.sql
   ```

### Production Deployment

1. **Link Project**:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```

2. **Push Migrations**:
   ```bash
   supabase db push
   ```

3. **Set Up Cron Jobs**:
   ```sql
   -- In Supabase Dashboard → Database → Cron Jobs
   
   -- Cleanup uploads (hourly)
   SELECT cron.schedule(
     'cleanup-uploads',
     '0 * * * *',
     'SELECT cleanup_old_uploads()'
   );
   
   -- Cleanup exports (every 15 minutes)
   SELECT cron.schedule(
     'cleanup-exports',
     '*/15 * * * *',
     'SELECT cleanup_old_exports()'
   );
   
   -- Cleanup cooldowns (hourly)
   SELECT cron.schedule(
     'cleanup-cooldowns',
     '0 * * * *',
     'SELECT cleanup_expired_cooldowns()'
   );
   ```

4. **Verify Deployment**:
   ```bash
   psql $DATABASE_URL -f supabase/verify-schema.sql
   ```

## Monitoring

### Key Metrics

1. **Queue Health**:
   ```sql
   SELECT 
     COUNT(*) FILTER (WHERE status = 'queued') as queued,
     COUNT(*) FILTER (WHERE status = 'processing') as processing,
     COUNT(*) FILTER (WHERE status = 'failed') as failed
   FROM jobs
   WHERE created_at > NOW() - INTERVAL '1 hour';
   ```

2. **Storage Usage**:
   ```sql
   SELECT 
     bucket_id,
     COUNT(*) as file_count,
     SUM(metadata->>'size')::bigint / 1024 / 1024 as total_mb
   FROM storage.objects
   GROUP BY bucket_id;
   ```

3. **LLM Costs**:
   ```sql
   SELECT 
     agent_type,
     COUNT(*) as calls,
     SUM(total_tokens) as total_tokens,
     AVG(latency_ms) as avg_latency_ms
   FROM llm_metrics
   WHERE created_at > NOW() - INTERVAL '24 hours'
   GROUP BY agent_type;
   ```

4. **User Activity**:
   ```sql
   SELECT 
     DATE(created_at) as date,
     COUNT(DISTINCT user_id) as active_users,
     COUNT(*) as total_uploads
   FROM jobs
   WHERE created_at > NOW() - INTERVAL '7 days'
   GROUP BY DATE(created_at)
   ORDER BY date DESC;
   ```

## Troubleshooting

### Common Issues

1. **Migration Fails**:
   - Check for syntax errors in SQL files
   - Verify Supabase CLI is up to date
   - Check database logs in Supabase Dashboard

2. **RLS Blocks Queries**:
   - Verify user is authenticated
   - Check policy conditions
   - Test with service role key (bypasses RLS)

3. **Storage Upload Fails**:
   - Verify MIME type is allowed
   - Check file size is under limit
   - Verify bucket exists and RLS policies are correct

4. **Queue Not Processing**:
   - Check active job count: `SELECT get_active_job_count()`
   - Verify queue positions: `SELECT * FROM jobs WHERE status = 'queued'`
   - Check for stuck jobs: `SELECT * FROM jobs WHERE status = 'processing' AND started_at < NOW() - INTERVAL '5 minutes'`

## Requirements Satisfied

This infrastructure setup satisfies the following requirements:

- **Requirement 7.1**: Secure temporary file storage ✅
- **Requirement 7.2**: 24-hour auto-deletion of files ✅
- **Requirement 7.3**: Wordlist-only retention (no documents) ✅
- **Requirement 7.4**: User-isolated file access ✅

## Next Steps

After infrastructure is deployed:
1. ✅ Task 1: Backend infrastructure (COMPLETE)
2. ⏭️ Task 2: Implement document parser service
3. ⏭️ Task 3: Implement LLM service with retry logic
4. ⏭️ Task 4: Implement AI agent services

## References

- [SCHEMA.md](./SCHEMA.md) - Detailed schema reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [verify-schema.sql](./verify-schema.sql) - Verification script
