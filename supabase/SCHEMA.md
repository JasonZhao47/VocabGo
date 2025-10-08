# Database Schema Reference

## Tables Overview

### jobs
Tracks document processing through the AI pipeline.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique job identifier |
| user_id | UUID | FOREIGN KEY → auth.users | Owner of the job |
| file_id | UUID | NOT NULL | Reference to uploaded file |
| filename | TEXT | NOT NULL | Original filename |
| document_type | TEXT | NOT NULL | File type (pdf, txt, docx, xlsx) |
| status | TEXT | CHECK | Job status: queued, processing, completed, failed |
| progress | INTEGER | 0-100 | Processing progress percentage |
| stage | TEXT | CHECK | Current stage: cleaning, extracting, translating |
| queue_position | INTEGER | NULLABLE | Position in queue (null if not queued) |
| retry_count | INTEGER | DEFAULT 0 | Number of retry attempts |
| error | TEXT | NULLABLE | Error message if failed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Job creation time |
| started_at | TIMESTAMPTZ | NULLABLE | Processing start time |
| completed_at | TIMESTAMPTZ | NULLABLE | Processing completion time |

**Indexes:**
- `idx_jobs_user_status` on (user_id, status)
- `idx_jobs_status_created` on (status, created_at)
- `idx_jobs_queue_position` on (queue_position) WHERE status = 'queued'

---

### wordlists
Stores saved bilingual wordlists.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique wordlist identifier |
| user_id | UUID | FOREIGN KEY → auth.users | Owner of the wordlist |
| job_id | UUID | FOREIGN KEY → jobs | Source job (nullable) |
| filename | TEXT | NOT NULL | Original document filename |
| document_type | TEXT | NOT NULL | Source document type |
| word_count | INTEGER | 0-40 | Number of word pairs |
| words | JSONB | NOT NULL | Array of {en, zh} objects |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation time |

**Indexes:**
- `idx_wordlists_user` on (user_id, created_at DESC)

**JSONB Structure:**
```json
[
  {"en": "vocabulary", "zh": "词汇"},
  {"en": "learning", "zh": "学习"}
]
```

---

### llm_metrics
Logs LLM API calls for monitoring and cost tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PRIMARY KEY | Unique metric identifier |
| job_id | UUID | FOREIGN KEY → jobs | Associated job |
| agent_type | TEXT | CHECK | Agent: cleaner, extractor, translator |
| prompt_tokens | INTEGER | ≥ 0 | Tokens in prompt |
| completion_tokens | INTEGER | ≥ 0 | Tokens in completion |
| total_tokens | INTEGER | ≥ 0 | Total tokens used |
| latency_ms | INTEGER | ≥ 0 | API call latency |
| model | TEXT | NOT NULL | LLM model name |
| confidence | NUMERIC(3,2) | 0-1 | Confidence score |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Metric timestamp |

**Indexes:**
- `idx_llm_metrics_job` on (job_id)

---

### upload_cooldowns
Enforces rate limiting on document uploads.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | UUID | PRIMARY KEY → auth.users | User identifier |
| last_upload_at | TIMESTAMPTZ | NOT NULL | Last upload timestamp |
| upload_count | INTEGER | ≥ 0 | Upload count in period |
| cooldown_until | TIMESTAMPTZ | NOT NULL | Cooldown expiration time |

**Indexes:**
- `idx_upload_cooldowns_until` on (cooldown_until)

---

## Storage Buckets

### document-uploads
Temporary storage for uploaded documents.

- **Retention**: 24 hours (auto-cleanup)
- **Max Size**: 50MB per file
- **Allowed Types**: 
  - `application/pdf`
  - `text/plain`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Path Structure**: `{user_id}/{file_id}.{ext}`

### wordlist-exports
Generated export files (CSV, XLSX).

- **Retention**: 1 hour (auto-cleanup)
- **Max Size**: 10MB per file
- **Allowed Types**:
  - `text/csv`
  - `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- **Path Structure**: `{user_id}/{wordlist_id}.{ext}`

---

## Functions

### update_queue_positions()
**Type**: Trigger Function  
**Purpose**: Automatically recalculates queue positions when job status changes  
**Trigger**: AFTER INSERT OR UPDATE OF status ON jobs

### get_active_job_count()
**Type**: Function  
**Returns**: INTEGER  
**Purpose**: Returns count of jobs with status = 'processing'

### cleanup_expired_cooldowns()
**Type**: Function  
**Returns**: void  
**Purpose**: Deletes cooldown records where cooldown_until < NOW()

### cleanup_old_uploads()
**Type**: Function  
**Returns**: void  
**Purpose**: Deletes files from document-uploads older than 24 hours

### cleanup_old_exports()
**Type**: Function  
**Returns**: void  
**Purpose**: Deletes files from wordlist-exports older than 1 hour

---

## Row Level Security (RLS)

All tables have RLS enabled. Policies:

### jobs, wordlists, upload_cooldowns
- Users can SELECT/INSERT/UPDATE/DELETE their own records
- Filtered by `auth.uid() = user_id`

### llm_metrics
- Only service role can access
- Filtered by `auth.jwt()->>'role' = 'service_role'`

### storage.objects (both buckets)
- Users can manage files in their own folder
- Folder structure: `{user_id}/...`
- Service role can manage all files (for cleanup)

---

## Common Queries

### Get user's active jobs
```sql
SELECT * FROM jobs 
WHERE user_id = auth.uid() 
AND status IN ('queued', 'processing')
ORDER BY created_at DESC;
```

### Get queue position for a job
```sql
SELECT queue_position FROM jobs 
WHERE id = $1 AND user_id = auth.uid();
```

### Get user's saved wordlists
```sql
SELECT * FROM wordlists 
WHERE user_id = auth.uid() 
ORDER BY created_at DESC;
```

### Check if user is in cooldown
```sql
SELECT cooldown_until > NOW() as in_cooldown,
       EXTRACT(EPOCH FROM (cooldown_until - NOW())) as seconds_remaining
FROM upload_cooldowns 
WHERE user_id = auth.uid();
```

### Get LLM metrics for a job
```sql
SELECT 
  agent_type,
  SUM(total_tokens) as total_tokens,
  AVG(latency_ms) as avg_latency,
  AVG(confidence) as avg_confidence
FROM llm_metrics 
WHERE job_id = $1
GROUP BY agent_type;
```

### Get active job count (for global limit)
```sql
SELECT get_active_job_count();
```

---

## Schema Verification

To verify the complete schema setup, run:

```bash
# For local development
supabase db reset

# For production
psql $DATABASE_URL -f supabase/verify-schema.sql
```

Or use the verification script:
```bash
psql $DATABASE_URL -f supabase/verify-schema.sql
```

All checks should return `✅ PASS` status.
