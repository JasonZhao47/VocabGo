# Supabase Backend Setup

This directory contains the database schema, migrations, and configuration for the VocabGo backend.

## Database Schema

### Tables

#### `jobs`
Tracks document processing jobs through the AI pipeline.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `user_id` → `auth.users`
- **Status Values**: `queued`, `processing`, `completed`, `failed`
- **Stages**: `cleaning`, `extracting`, `translating`

#### `wordlists`
Stores saved bilingual wordlists.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `user_id` → `auth.users`, `job_id` → `jobs`
- **Constraint**: `word_count` ≤ 40
- **Data**: `words` stored as JSONB array of `{en, zh}` objects

#### `llm_metrics`
Logs LLM API calls for monitoring and cost tracking.
- **Primary Key**: `id` (UUID)
- **Foreign Keys**: `job_id` → `jobs`
- **Agent Types**: `cleaner`, `extractor`, `translator`
- **Metrics**: token counts, latency, confidence scores

#### `upload_cooldowns`
Enforces rate limiting on document uploads.
- **Primary Key**: `user_id` (UUID)
- **Foreign Keys**: `user_id` → `auth.users`
- **Purpose**: Prevents rapid successive uploads

### Storage Buckets

#### `document-uploads`
- **Purpose**: Temporary storage for uploaded documents
- **TTL**: 24 hours (auto-cleanup)
- **Size Limit**: 50MB per file
- **Allowed Types**: PDF, TXT, DOCX, XLSX

#### `wordlist-exports`
- **Purpose**: Generated export files (CSV, XLSX)
- **TTL**: 1 hour (auto-cleanup)
- **Size Limit**: 10MB per file
- **Allowed Types**: CSV, XLSX

## Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Users can only access their own data
- Service role has full access for system operations
- LLM metrics are only accessible to service role

## Setup Instructions

### Prerequisites
- Supabase CLI installed: `npm install -g supabase`
- Supabase project created at https://supabase.com

### Local Development

1. **Initialize Supabase locally**:
   ```bash
   supabase init
   ```

2. **Start local Supabase**:
   ```bash
   supabase start
   ```

3. **Run migrations**:
   ```bash
   supabase db reset
   ```

4. **Get local credentials**:
   ```bash
   supabase status
   ```

### Production Deployment

1. **Link to your project**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

2. **Push migrations**:
   ```bash
   supabase db push
   ```

3. **Verify deployment**:
   ```bash
   supabase db diff
   ```

## Environment Variables

Add these to your `.env.local` file:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

For Edge Functions, add:

```bash
GLM_API_KEY=your-glm-api-key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions
GLM_MODEL=glm-4-flash
```

## Maintenance

### Cleanup Functions

The following functions run automatically:

- `cleanup_old_uploads()`: Removes files older than 24 hours from `document-uploads`
- `cleanup_old_exports()`: Removes files older than 1 hour from `wordlist-exports`
- `cleanup_expired_cooldowns()`: Removes expired cooldown records

Set up cron jobs in Supabase Dashboard → Database → Cron Jobs:

```sql
-- Run every hour
SELECT cron.schedule('cleanup-uploads', '0 * * * *', 'SELECT cleanup_old_uploads()');
SELECT cron.schedule('cleanup-exports', '*/15 * * * *', 'SELECT cleanup_old_exports()');
SELECT cron.schedule('cleanup-cooldowns', '0 * * * *', 'SELECT cleanup_expired_cooldowns()');
```

## Indexes

Optimized indexes for common queries:
- `idx_jobs_user_status`: Fast job lookups by user and status
- `idx_jobs_status_created`: Queue ordering
- `idx_jobs_queue_position`: Queue position queries
- `idx_wordlists_user`: User's wordlist history
- `idx_llm_metrics_job`: Metrics aggregation per job

## Monitoring

Query active jobs:
```sql
SELECT COUNT(*) FROM jobs WHERE status = 'processing';
```

Check queue depth:
```sql
SELECT COUNT(*) FROM jobs WHERE status = 'queued';
```

View LLM costs:
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
