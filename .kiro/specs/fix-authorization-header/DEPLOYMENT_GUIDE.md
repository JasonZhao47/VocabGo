# Deployment Guide - Authorization Header Fix

## Pre-Deployment Checklist

- ✅ All edge functions updated with shared auth utilities
- ✅ Health check handling added to all functions
- ✅ Graceful error handling implemented
- ✅ No breaking changes to existing functionality
- ✅ Code reviewed and tested locally

## Deployment Steps

### 1. Verify Supabase CLI is Installed

```bash
supabase --version
```

If not installed, install it:
```bash
brew install supabase/tap/supabase  # macOS
# or
npm install -g supabase             # npm
```

### 2. Login to Supabase

```bash
supabase login
```

### 3. Link to Your Project

```bash
supabase link --project-ref your-project-ref
```

### 4. Deploy All Functions

Deploy all functions at once:

```bash
cd supabase
supabase functions deploy
```

Or deploy individually:

```bash
# Core wordlist functions
supabase functions deploy save-wordlist
supabase functions deploy delete-wordlist
supabase functions deploy fetch-wordlists
supabase functions deploy process-document

# Practice functions
supabase functions deploy generate-practice-questions
supabase functions deploy share-practice-set
supabase functions deploy get-shared-practice
supabase functions deploy fetch-practice-history
supabase functions deploy save-practice-session

# Maintenance functions
supabase functions deploy cleanup-practice-sessions
supabase functions deploy cleanup-practice-cache
```

### 5. Verify Deployment

Check function logs:

```bash
supabase functions logs
```

Test health check endpoint:

```bash
curl -X GET https://your-project.supabase.co/functions/v1/save-wordlist
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T03:30:00.000Z"
}
```

### 6. Monitor for Errors

Watch logs for 5-10 minutes:

```bash
supabase functions logs --follow
```

You should see:
- ✅ No more "Missing authorization header" errors
- ✅ Health check requests returning 200 OK
- ✅ Normal requests working as before

## Rollback Plan

If issues occur, rollback is simple since we didn't change the database schema or API contracts:

1. **Revert the changes:**
   ```bash
   git revert HEAD
   ```

2. **Redeploy previous version:**
   ```bash
   supabase functions deploy
   ```

## Post-Deployment Verification

### Test 1: Health Check
```bash
curl -X GET https://your-project.supabase.co/functions/v1/save-wordlist
```
Expected: `{"status": "healthy", ...}`

### Test 2: Missing Auth
```bash
curl -X POST https://your-project.supabase.co/functions/v1/save-wordlist \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.pdf"}'
```
Expected: `{"success": false, "error": {"code": "UNAUTHORIZED", ...}}`

### Test 3: Valid Request
```bash
curl -X POST https://your-project.supabase.co/functions/v1/save-wordlist \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: test-session-123" \
  -H "apikey: your-anon-key" \
  -d '{
    "filename": "test.pdf",
    "documentType": "pdf",
    "words": [{"en": "test", "zh": "测试"}]
  }'
```
Expected: `{"success": true, "wordlistId": "..."}`

## Monitoring

### Key Metrics to Watch

1. **Error Rate:** Should drop to near zero for "Missing authorization header"
2. **Response Times:** Should remain unchanged
3. **Success Rate:** Should remain at current levels
4. **Health Check Success:** Should be 100%

### Log Patterns to Look For

✅ **Good:**
```
Health check request handled
Session validated successfully
Request processed successfully
```

❌ **Bad:**
```
Missing authorization header
getAuthToken error
Unexpected error in auth
```

## Troubleshooting

### Issue: Functions not deploying

**Solution:**
```bash
# Check Supabase CLI version
supabase --version

# Update if needed
brew upgrade supabase

# Try deploying with verbose output
supabase functions deploy --debug
```

### Issue: Health checks still failing

**Solution:**
1. Check if the function actually deployed:
   ```bash
   supabase functions list
   ```

2. Verify the code is correct:
   ```bash
   cat supabase/functions/save-wordlist/index.ts | grep isHealthCheck
   ```

3. Check function logs:
   ```bash
   supabase functions logs save-wordlist
   ```

### Issue: Existing functionality broken

**Solution:**
1. Check if session ID is being sent:
   ```bash
   # In browser console
   console.log(document.cookie)
   ```

2. Verify frontend is sending headers:
   ```javascript
   // Check network tab in DevTools
   // Look for X-Session-ID header
   ```

3. Rollback if needed (see Rollback Plan above)

## Success Criteria

✅ No "Missing authorization header" errors in logs for 24 hours
✅ Health checks returning 200 OK consistently
✅ All existing functionality working normally
✅ Frontend users experiencing no issues
✅ Error logs showing proper 401 responses for invalid requests

## Timeline

- **Deployment:** 5-10 minutes
- **Initial Verification:** 10-15 minutes
- **Monitoring Period:** 24 hours
- **Sign-off:** After 24 hours of stable operation

---

**Deployed By:** _____________
**Deployment Date:** _____________
**Verified By:** _____________
**Sign-off Date:** _____________
