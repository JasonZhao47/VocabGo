# Migration Guide: Student Tracking & Sharing Feature

## Overview

This guide helps you integrate the student tracking and sharing feature into your VocabGo application. The feature enables teachers to share wordlists with students and track their practice performance.

## Prerequisites

- Supabase project configured
- Database migrations applied
- Edge functions deployed
- Environment variables configured

## Step 1: Database Setup

### Apply Migration

```bash
# Apply the student tracking migration
supabase db push

# Or manually apply the migration file
psql $DATABASE_URL -f supabase/migrations/20250117000001_student_tracking.sql
```

### Verify Tables Created

The migration creates:
- `shared_wordlists` - Stores sharing tokens and metadata
- `student_sessions` - Tracks student practice sessions
- `practice_mistakes` - Records incorrect answers
- `student_practice_stats_mv` - Materialized view for performance stats

### Set Up Materialized View Refresh

```sql
-- Create a cron job to refresh stats every 5 minutes
SELECT cron.schedule(
  'refresh-practice-stats',
  '*/5 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY student_practice_stats_mv$$
);
```

## Step 2: Edge Functions Deployment

### Deploy Required Functions

```bash
# Deploy all sharing-related functions
supabase functions deploy share-wordlist
supabase functions deploy register-student-session
supabase functions deploy record-practice-mistake
supabase functions deploy fetch-practice-stats
supabase functions deploy generate-questions-from-mistakes
```

### Set Environment Variables

Ensure these are set in your Supabase project:

```bash
# GLM API credentials
GLM_API_KEY=your_api_key
GLM_API_URL=https://open.bigmodel.cn/api/paas/v4/chat/completions

# Supabase credentials (auto-set in edge functions)
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

## Step 3: Frontend Integration

### Install Dependencies

All required dependencies are already in `package.json`. Run:

```bash
pnpm install
```

### Add Routes

The routes are already configured in `src/router/index.ts`:

```typescript
// Teacher view - practice dashboard
{
  path: '/practice/:wordlistId',
  name: 'practice-dashboard',
  component: () => import('@/pages/PracticeDashboard.vue')
}

// Student view - practice interface
{
  path: '/student/:shareToken',
  name: 'student-practice',
  component: () => import('@/pages/StudentPracticeView.vue')
}
```

### Update SavedWordlistsPage

Add the share button to your wordlist display:

```vue
<template>
  <div v-for="wordlist in wordlists" :key="wordlist.id">
    <!-- Existing wordlist display -->
    
    <!-- Add share button -->
    <ShareWordlistButton :wordlist-id="wordlist.id" />
  </div>
</template>

<script setup lang="ts">
import ShareWordlistButton from '@/components/sharing/ShareWordlistButton.vue'
</script>
```

## Step 4: Testing

### Run Unit Tests

```bash
# Test all sharing components
pnpm test src/components/sharing
pnpm test src/services/sharingService
pnpm test src/composables/useStudentSession
pnpm test src/composables/usePracticeStats

# Test edge functions
pnpm test supabase/functions/share-wordlist
pnpm test supabase/functions/register-student-session
pnpm test supabase/functions/record-practice-mistake
pnpm test supabase/functions/fetch-practice-stats
```

### Run E2E Tests

```bash
# Test complete sharing workflow
pnpm test tests/e2e/sharing-workflow.test.ts
```

### Manual Testing Checklist

1. **Teacher Flow**
   - [ ] Navigate to saved wordlists
   - [ ] Click share button on a wordlist
   - [ ] Copy the generated share link
   - [ ] Verify modal shows link and QR code
   - [ ] Navigate to practice dashboard
   - [ ] Verify empty state shows when no students

2. **Student Flow**
   - [ ] Open share link in incognito/private window
   - [ ] Enter a nickname
   - [ ] Verify practice questions load
   - [ ] Answer questions (mix correct/incorrect)
   - [ ] Complete practice session
   - [ ] Verify results display

3. **Teacher Dashboard**
   - [ ] Refresh practice dashboard
   - [ ] Verify student appears in list
   - [ ] Check accuracy percentage
   - [ ] View mistake details
   - [ ] Generate targeted questions
   - [ ] Verify new questions appear

## Step 5: Configuration

### Design Tokens

Customize sharing UI colors in `src/config/sharingDesignTokens.ts`:

```typescript
export const sharingTokens = {
  colors: {
    primary: '#3b82f6',      // Share button color
    success: '#10b981',      // Success states
    warning: '#f59e0b',      // Warning states
    error: '#ef4444',        // Error states
  },
  // ... other tokens
}
```

### Performance Tuning

Adjust materialized view refresh frequency based on your needs:

```sql
-- More frequent updates (every minute)
SELECT cron.schedule(
  'refresh-practice-stats',
  '* * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY student_practice_stats_mv$$
);

-- Less frequent updates (every 15 minutes)
SELECT cron.schedule(
  'refresh-practice-stats',
  '*/15 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY student_practice_stats_mv$$
);
```

## Step 6: Security Considerations

### Share Token Security

- Tokens are cryptographically secure (32 bytes, base64url encoded)
- Tokens expire after 30 days by default
- No authentication required for students (anonymous access)
- Device fingerprinting prevents duplicate sessions

### Rate Limiting

Consider adding rate limiting to edge functions:

```typescript
// In edge function
const rateLimitKey = `share:${userId}:${Date.now()}`
// Implement rate limiting logic
```

### Data Privacy

- Student nicknames are not validated or sanitized (consider adding)
- Practice data is tied to device fingerprints, not personal info
- Teachers can only see aggregated stats, not individual student identities

## Step 7: Monitoring

### Key Metrics to Track

1. **Share Link Usage**
   - Number of shares created
   - Share link click-through rate
   - Active vs expired shares

2. **Student Engagement**
   - Number of student sessions
   - Average questions per session
   - Session completion rate

3. **Performance**
   - Materialized view refresh time
   - Edge function response times
   - Database query performance

### Database Queries

```sql
-- Active shares
SELECT COUNT(*) FROM shared_wordlists 
WHERE expires_at > NOW();

-- Student sessions today
SELECT COUNT(*) FROM student_sessions 
WHERE created_at > NOW() - INTERVAL '1 day';

-- Average accuracy
SELECT AVG(accuracy_percentage) 
FROM student_practice_stats_mv;
```

## Troubleshooting

### Share Link Not Working

1. Check token hasn't expired:
```sql
SELECT * FROM shared_wordlists WHERE share_token = 'your_token';
```

2. Verify edge function is deployed:
```bash
supabase functions list
```

3. Check edge function logs:
```bash
supabase functions logs register-student-session
```

### Stats Not Updating

1. Check materialized view refresh:
```sql
SELECT * FROM pg_stat_user_tables 
WHERE relname = 'student_practice_stats_mv';
```

2. Manually refresh:
```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY student_practice_stats_mv;
```

3. Verify cron job is running:
```sql
SELECT * FROM cron.job WHERE jobname = 'refresh-practice-stats';
```

### Performance Issues

1. Add indexes if needed:
```sql
CREATE INDEX IF NOT EXISTS idx_practice_mistakes_session 
ON practice_mistakes(student_session_id);

CREATE INDEX IF NOT EXISTS idx_student_sessions_wordlist 
ON student_sessions(shared_wordlist_id);
```

2. Monitor query performance:
```sql
SELECT * FROM pg_stat_statements 
WHERE query LIKE '%student_practice_stats_mv%';
```

## Rollback Plan

If you need to rollback the feature:

1. **Remove Routes**
```typescript
// Comment out in src/router/index.ts
// { path: '/practice/:wordlistId', ... }
// { path: '/student/:shareToken', ... }
```

2. **Undeploy Functions**
```bash
supabase functions delete share-wordlist
supabase functions delete register-student-session
supabase functions delete record-practice-mistake
supabase functions delete fetch-practice-stats
supabase functions delete generate-questions-from-mistakes
```

3. **Drop Tables** (⚠️ This deletes all data)
```sql
DROP MATERIALIZED VIEW IF EXISTS student_practice_stats_mv;
DROP TABLE IF EXISTS practice_mistakes;
DROP TABLE IF EXISTS student_sessions;
DROP TABLE IF EXISTS shared_wordlists;
```

## Next Steps

After successful migration:

1. Review the [User Guide](./USER_GUIDE.md) for feature usage
2. Check [Performance Testing Guide](./PERFORMANCE_TESTING_GUIDE.md) for optimization
3. Monitor edge function logs for errors
4. Gather user feedback on the sharing workflow
5. Consider adding analytics tracking for share link usage

## Support

For issues or questions:
- Check edge function logs: `supabase functions logs <function-name>`
- Review test files for expected behavior
- Consult design document: `design.md`
- Check task completion summaries for implementation details
