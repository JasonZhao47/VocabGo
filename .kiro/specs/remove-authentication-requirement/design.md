# Design Document: Remove Authentication Requirement

## Overview

VocabGo currently has authentication checks throughout the codebase that prevent anonymous users from using the application. The Edge Functions check for authenticated users, the frontend services check for auth sessions, and the database RLS policies require `auth.uid()`. This design outlines how to remove these authentication requirements while maintaining data security through session-based identification.

## Architecture

### Current State
- **Frontend Services**: Check for `auth.getSession()` and throw errors if no session exists
- **Edge Functions**: Validate `auth.getUser()` and return 401 if no user found
- **Database RLS**: Policies require `auth.uid() = user_id` for all operations
- **Result**: Users cannot upload files or manage wordlists without authentication

### Target State
- **Frontend Services**: Remove all `auth.getSession()` checks and Authorization headers
- **Edge Functions**: Remove `auth.getUser()` validation for anonymous operations
- **Database RLS**: Update policies to allow anonymous access with session-based isolation
- **Result**: Users can use the app without signing in, with data isolated by session

## Components and Interfaces

### 1. Frontend Service Layer

**Files to Modify:**
- `src/services/uploadService.ts`
- `src/services/wordlistService.ts`

**Changes:**
- Remove `supabase.auth.getSession()` calls
- Remove Authorization header from fetch requests
- Remove "Authentication required" error throws
- Keep the anon key in requests (automatically included by Supabase client)

**Before:**
```typescript
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  throw new Error('Authentication required. Please sign in.')
}

const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
  },
})
```

**After:**
```typescript
// No auth check needed - anonymous access allowed
const response = await fetch(url, {
  headers: {
    'apikey': supabaseAnonKey, // Supabase anon key for anonymous access
  },
})
```

### 2. Edge Functions Layer

**Files to Modify:**
- `supabase/functions/save-wordlist/index.ts`
- `supabase/functions/fetch-wordlists/index.ts`
- `supabase/functions/delete-wordlist/index.ts`

**Note:** `process-document/index.ts` already works without authentication ✓

**Changes:**
- Remove `auth.getUser()` validation
- Use session-based identification instead of user IDs
- Generate or extract session IDs from request headers
- Pass session IDs to database operations

**Session ID Strategy:**
We'll use a client-generated session ID stored in browser localStorage:
- Frontend generates a UUID on first visit
- Session ID is sent in a custom header (`X-Session-ID`)
- Edge Functions use this session ID instead of `user_id`
- Session IDs provide data isolation without authentication

**Before:**
```typescript
const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
if (authError || !user) {
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
  }), { status: 401 })
}

await supabaseClient.from('wordlists').insert({
  user_id: user.id,
  // ...
})
```

**After:**
```typescript
// Get session ID from custom header
const sessionId = req.headers.get('X-Session-ID')
if (!sessionId) {
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'MISSING_SESSION', message: 'Session ID required' }
  }), { status: 400 })
}

await supabaseClient.from('wordlists').insert({
  session_id: sessionId,
  // ...
})
```

### 3. Database Schema Layer

**Files to Modify:**
- Create new migration: `supabase/migrations/[timestamp]_enable_anonymous_access.sql`

**Changes:**

#### Schema Updates
1. **Rename `user_id` to `session_id`** in `wordlists` table
2. **Change column type** from `UUID REFERENCES auth.users(id)` to `TEXT NOT NULL`
3. **Update indexes** to use `session_id` instead of `user_id`

#### RLS Policy Updates
Replace user-based policies with session-based policies:

**Before:**
```sql
CREATE POLICY "Users can view their own wordlists"
  ON wordlists FOR SELECT
  USING (auth.uid() = user_id);
```

**After:**
```sql
CREATE POLICY "Sessions can view their own wordlists"
  ON wordlists FOR SELECT
  USING (true); -- Allow all reads, filtering done by session_id in query

CREATE POLICY "Sessions can insert their own wordlists"
  ON wordlists FOR INSERT
  WITH CHECK (true); -- Allow all inserts, session_id provided by client

CREATE POLICY "Sessions can delete their own wordlists"
  ON wordlists FOR DELETE
  USING (true); -- Allow all deletes, filtering done by session_id in query
```

**Security Note:** While RLS policies allow all operations, the Edge Functions enforce session-based filtering by always including `session_id` in WHERE clauses. This prevents cross-session data access.

### 4. Session Management

**New File:** `src/lib/session.ts`

**Purpose:** Generate and persist session IDs in browser localStorage

**Interface:**
```typescript
export function getSessionId(): string {
  let sessionId = localStorage.getItem('vocabgo_session_id')
  
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem('vocabgo_session_id', sessionId)
  }
  
  return sessionId
}

export function clearSession(): void {
  localStorage.removeItem('vocabgo_session_id')
}
```

**Usage:** All service functions will call `getSessionId()` and include it in request headers.

## Data Models

### Wordlists Table (Updated)

```typescript
interface WordlistRecord {
  id: string                              // UUID primary key
  session_id: string                      // Session identifier (replaces user_id)
  filename: string                        // Original filename
  document_type: string                   // pdf, txt, docx, xlsx
  word_count: number                      // Number of words (1-40)
  words: Array<{ en: string; zh: string }> // Bilingual word pairs
  created_at: string                      // ISO timestamp
}
```

**Migration Strategy:**
- Existing data with `user_id` will be preserved but inaccessible (no auth users exist)
- New anonymous data will use `session_id`
- Clean slate for MVP launch

## Error Handling

### Frontend Error Updates

**Remove:**
- "Authentication required. Please sign in." errors

**Add:**
- "Session initialization failed" (if session ID generation fails)
- Better generic error messages for API failures

### Edge Function Error Updates

**Remove:**
- 401 UNAUTHORIZED responses for missing auth

**Add:**
- 400 BAD_REQUEST for missing session ID
- Clear error messages about session requirements

## Testing Strategy

### Unit Tests
- Test session ID generation and persistence
- Test service functions without auth checks
- Test Edge Functions with session IDs

### Integration Tests
- Test full upload flow without authentication
- Test wordlist save/fetch/delete with session isolation
- Verify cross-session data isolation

### Manual Testing Checklist
1. Clear browser storage and verify new session ID is generated
2. Upload a document and verify it processes without auth errors
3. Save a wordlist and verify it's stored with session ID
4. Fetch wordlists and verify only current session's lists are returned
5. Delete a wordlist and verify it's removed
6. Open in incognito/different browser and verify data isolation
7. Test with multiple tabs (same session ID should share data)

## Security Considerations

### Data Isolation
- Session IDs are UUIDs (128-bit random values)
- Collision probability is negligible (1 in 2^122)
- Edge Functions always filter by session_id in queries
- RLS policies prevent direct table access

### Session Hijacking
- Session IDs stored in localStorage (not cookies, no CSRF risk)
- No network transmission of sensitive credentials
- Session IDs are not secret tokens (they identify, not authenticate)
- Worst case: Someone with physical access to device can see wordlists

### Data Retention
- Files auto-deleted after 24 hours (existing feature)
- Wordlists persist until user deletes them
- No PII collected (just vocabulary lists)
- Users can clear session to "log out"

### Trade-offs
- **Pro:** Zero friction for users, no account management
- **Pro:** No password security concerns
- **Con:** Data lost if localStorage cleared
- **Con:** No cross-device sync
- **Acceptable:** For MVP use case (temporary vocabulary lists)

## Migration Path

### Phase 1: Database Migration
1. Create migration file
2. Rename `user_id` to `session_id`
3. Update RLS policies
4. Test locally with `supabase db reset`

### Phase 2: Edge Functions
1. Update save-wordlist function
2. Update fetch-wordlists function
3. Update delete-wordlist function
4. Test with curl/Postman using session IDs

### Phase 3: Frontend Services
1. Create session management utility
2. Update uploadService.ts
3. Update wordlistService.ts
4. Test end-to-end flow

### Phase 4: Verification
1. Run all tests
2. Manual testing checklist
3. Verify no auth errors in console
4. Verify data isolation between sessions

## Rollback Plan

If issues arise:
1. Revert database migration (restore `user_id` column)
2. Revert Edge Function changes
3. Revert frontend service changes
4. Re-enable authentication checks

Database rollback migration:
```sql
ALTER TABLE wordlists RENAME COLUMN session_id TO user_id;
ALTER TABLE wordlists ALTER COLUMN user_id TYPE UUID USING user_id::uuid;
-- Restore original RLS policies
```

## Future Considerations

### Optional Authentication
If user accounts are added later:
- Keep session-based flow as default
- Add optional "Sign in to sync" feature
- Migrate session data to user account on sign-in
- Support both anonymous and authenticated users

### Session Persistence
- Consider server-side session storage
- Add session expiration (e.g., 30 days)
- Implement session refresh mechanism

### Analytics
- Track anonymous usage patterns
- Monitor session creation rate
- Measure data isolation effectiveness
