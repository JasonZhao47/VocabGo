# Practice Questions Authorization Fix - Complete

## Issue
The practice question generation functions were returning "Missing authorization header" errors because they weren't configured to skip JWT verification like the other edge functions.

## Solution
Added `verify_jwt = false` configuration for all practice-related edge functions in `supabase/config.toml`:

```toml
[functions.generate-practice-questions]
verify_jwt = false
[functions.save-practice-session]
verify_jwt = false
[functions.fetch-practice-history]
verify_jwt = false
[functions.share-practice-set]
verify_jwt = false
[functions.get-shared-practice]
verify_jwt = false
[functions.cleanup-practice-sessions]
verify_jwt = false
[functions.cleanup-practice-cache]
verify_jwt = false
```

## Verification

### 1. Restart Supabase
```bash
supabase stop && supabase start
```

### 2. Test with curl
```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-practice-questions' \
  --header 'Authorization: Bearer sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
  --header 'x-session-id: test-session-123' \
  --header 'Content-Type: application/json' \
  --data '{"wordlistId": "test-id"}'
```

**Expected Result:** Should return `WORDLIST_NOT_FOUND` error (not authorization error)

### 3. Test in Browser
1. Upload a document and generate a wordlist
2. Navigate to the wordlist detail page
3. Click "Generate Practice Questions"
4. Should now work without authorization errors

## Technical Details

The issue was that Supabase Edge Functions by default require JWT verification. Since this app uses session-based authentication (via `x-session-id` header) instead of JWT tokens, we need to explicitly disable JWT verification for each function.

The auth validation is handled by the custom `getSessionId()` function in `supabase/functions/_shared/auth.ts`, which validates the session ID instead of JWT tokens.

## Status
✅ Fixed - All practice question functions now properly handle session-based authentication
