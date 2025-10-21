# "Start Practice" Authorization Header Error - Diagnosis

## Problem
When clicking "Start Practice", users encounter a "Missing authorization header" error:

```
Error: Missing authorization header
    at getAuthToken (file:///var/tmp/sb-compile-edge-runtime/root/index.ts:83:11)
```

## Root Cause
The Supabase edge runtime has **cached compiled versions** of old edge functions that contain outdated authentication logic. The cache persists even after:
- Restarting Supabase
- Removing empty function directories
- Code changes to auth utilities

The compiled functions in `/var/tmp/sb-compile-edge-runtime/` still reference `getAuthToken()` which no longer exists.

## Evidence
1. **Error persists after restart**: Still occurs after `supabase stop` and `supabase start`
2. **Error location**: `getAuthToken` at line 83 in `/var/tmp/sb-compile-edge-runtime/root/index.ts`
3. **Current code**: `_shared/auth.ts` uses `getSessionId()` not `getAuthToken()`
4. **Empty directories removed**: Cleaned up `cleanup-practice-sessions` and `share-practice-set`

## Solution

### Option 1: Clear Supabase Cache (Recommended)
```bash
# Stop Supabase completely
pnpm supabase stop

# Clear the edge runtime cache
rm -rf /var/tmp/sb-compile-edge-runtime/

# Restart Supabase
pnpm supabase start
```

### Option 2: Full Reset
```bash
# Nuclear option - reset everything
pnpm supabase db reset

# This will:
# - Drop and recreate the database
# - Recompile all edge functions
# - Clear all caches
```

### Option 3: Check for Rogue Functions
The error might be coming from a function that's not in your current codebase but is still registered. Check:

```bash
# List all running functions
curl http://127.0.0.1:54321/functions/v1/

# Check Supabase config
cat supabase/config.toml | grep -A 20 "\[functions\]"
```

## Prevention
1. After major auth refactoring, always clear the edge runtime cache
2. Remove empty function directories immediately
3. Use `supabase functions list` to verify what's deployed

## Next Steps
1. Try clearing the cache (Option 1)
2. If that doesn't work, check which function is actually throwing the error by looking at the request URL in the logs
3. Verify that function's code matches what's in your repository

## Related Files
- `supabase/functions/_shared/auth.ts` - Current auth utilities
- `supabase/functions/register-student-session/index.ts` - Student session registration
- `supabase/functions/record-practice-mistake/index.ts` - Mistake recording
- `/var/tmp/sb-compile-edge-runtime/` - Cached compiled functions (needs clearing)
