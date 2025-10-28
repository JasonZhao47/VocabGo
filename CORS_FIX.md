# CORS Fix Applied

## Issue
Production deployment was blocked by CORS error:
```
Request header field x-session-id is not allowed by Access-Control-Allow-Headers in preflight response
```

## Root Cause
The `x-session-id` custom header wasn't included in the CORS `Access-Control-Allow-Headers` for all edge functions.

## Fix Applied
Updated CORS headers in all edge functions to include `x-session-id`:

**Updated Functions:**
- ✅ `process-document` - Added x-session-id
- ✅ `register-student-session` - Added x-session-id  
- ✅ `record-practice-mistake` - Added x-session-id

**Already Had x-session-id:**
- ✅ `save-wordlist`
- ✅ `delete-wordlist`
- ✅ `fetch-wordlists`
- ✅ `generate-practice-questions`
- ✅ `generate-questions-from-mistakes`
- ✅ `fetch-practice-stats`
- ✅ `share-wordlist`

## Next Steps

### 1. Redeploy Edge Functions to Production

You need to redeploy all functions to Supabase production:

```bash
# Make sure you're linked to your production project
supabase link --project-ref your-project-ref

# Deploy all functions (this will update them with the CORS fix)
supabase functions deploy process-document
supabase functions deploy save-wordlist
supabase functions deploy delete-wordlist
supabase functions deploy fetch-wordlists
supabase functions deploy generate-practice-questions
supabase functions deploy generate-questions-from-mistakes
supabase functions deploy register-student-session
supabase functions deploy record-practice-mistake
supabase functions deploy fetch-practice-stats
supabase functions deploy share-wordlist
```

Or deploy all at once:
```bash
for func in process-document save-wordlist delete-wordlist fetch-wordlists \
  generate-practice-questions generate-questions-from-mistakes \
  register-student-session record-practice-mistake \
  fetch-practice-stats share-wordlist; do
  echo "Deploying $func..."
  supabase functions deploy $func
done
```

### 2. Verify the Fix

After redeployment, test in production:

1. Go to https://vocab-go.vercel.app
2. Try uploading a document
3. Check browser console - CORS error should be gone
4. Verify wordlist generation works

### 3. If Still Having Issues

If CORS errors persist after redeployment:

**Check Supabase Dashboard:**
1. Go to Edge Functions in Supabase Dashboard
2. Click on `process-document`
3. Check the "Logs" tab for any errors
4. Verify the function was deployed successfully

**Check Browser Network Tab:**
1. Open DevTools > Network
2. Find the OPTIONS request (preflight)
3. Check Response Headers for `Access-Control-Allow-Headers`
4. Should include: `authorization, x-client-info, apikey, content-type, x-session-id`

**Alternative: Temporary Workaround**
If you need immediate access, you can temporarily remove the `x-session-id` header from frontend requests, but this will break session tracking.

## Technical Details

**CORS Preflight:**
When browsers send custom headers (like `x-session-id`), they first send an OPTIONS request to check if the server allows it. The server must respond with the allowed headers in `Access-Control-Allow-Headers`.

**Our Fix:**
Changed from:
```typescript
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
```

To:
```typescript
'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-id'
```

This tells browsers that `x-session-id` is an allowed custom header.
