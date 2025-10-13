# Local Testing Setup - Complete

## What You Have Now

### 1. Shared Auth Utility
✅ `supabase/functions/_shared/auth.ts`
- Graceful session ID extraction
- Health check detection
- Standardized error responses

### 2. Updated Edge Functions (12 total)
✅ All functions now use the shared auth utility
✅ All functions handle health checks gracefully
✅ All functions return proper HTTP status codes

### 3. Testing Scripts

#### Quick Setup Check
```bash
./scripts/check-local-setup.sh
```
Verifies:
- Supabase CLI installed
- Supabase running
- Functions directory exists
- Auth utility exists
- Functions server accessible

#### Automated Tests
```bash
./scripts/test-local-edge-functions.sh
```
Tests:
- Health checks (5 functions)
- Missing auth handling (3 functions)
- Valid requests (2 functions)

### 4. Documentation

- ✅ `LOCAL_TESTING_GUIDE.md` - Comprehensive guide
- ✅ `QUICK_LOCAL_TEST.md` - 3-step quick start
- ✅ `ELEGANT_FIX_SUMMARY.md` - Problem & solution overview
- ✅ `DEPLOYMENT_GUIDE.md` - Production deployment steps
- ✅ `QUICK_REFERENCE.md` - Code patterns & usage

## How to Test Locally

### Option 1: Quick Test (Recommended)

```bash
# 1. Check setup
./scripts/check-local-setup.sh

# 2. If functions server not running, start it
supabase functions serve

# 3. Run automated tests
./scripts/test-local-edge-functions.sh
```

### Option 2: Manual Testing

```bash
# 1. Start Supabase
supabase start

# 2. Serve functions
supabase functions serve

# 3. Test health check
curl http://localhost:54321/functions/v1/save-wordlist

# 4. Test missing auth
ANON_KEY=$(supabase status | grep "anon key:" | awk '{print $3}')
curl -X POST http://localhost:54321/functions/v1/save-wordlist \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{"filename":"test.pdf"}'

# 5. Test valid request
curl -X POST http://localhost:54321/functions/v1/save-wordlist \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "X-Session-ID: test-123" \
  -d '{"filename":"test.pdf","documentType":"pdf","words":[{"en":"hello","zh":"你好"}]}'
```

### Option 3: Frontend Testing

```bash
# 1. Update .env.local
echo "VITE_SUPABASE_URL=http://localhost:54321" > .env.local
echo "VITE_SUPABASE_ANON_KEY=$(supabase status | grep 'anon key:' | awk '{print $3}')" >> .env.local

# 2. Start dev server
pnpm dev

# 3. Test in browser
# - Upload documents
# - Save wordlists
# - Generate practice questions
```

## Expected Results

### ✅ Health Checks
```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T..."
}
```

### ✅ Missing Auth
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Session ID required"
  }
}
```

### ✅ Valid Requests
```json
{
  "success": true,
  "wordlistId": "uuid-here"
}
```

## Monitoring

### Watch Function Logs
```bash
# In a separate terminal
supabase functions logs --follow
```

Look for:
- ✅ No "Missing authorization header" errors
- ✅ Health check requests returning 200
- ✅ Clear 401 responses for invalid auth
- ✅ Successful processing of valid requests

## Common Issues

### Issue: "Supabase is not running"
```bash
supabase start
```

### Issue: "Functions server not accessible"
```bash
# In a separate terminal
supabase functions serve
```

### Issue: "Connection refused"
```bash
# Check status
supabase status

# Restart if needed
supabase stop
supabase start
```

### Issue: "Import errors"
```bash
# Make sure you're in the right directory
cd supabase
supabase functions serve
```

## Next Steps After Local Testing

1. ✅ Verify all tests pass locally
2. ✅ Test with frontend locally
3. ✅ Commit changes
4. ✅ Deploy to production: `supabase functions deploy`
5. ✅ Monitor production logs for 24 hours
6. ✅ Verify no authorization errors in production

## Quick Commands Reference

```bash
# Check setup
./scripts/check-local-setup.sh

# Run tests
./scripts/test-local-edge-functions.sh

# Start Supabase
supabase start

# Serve functions
supabase functions serve

# Watch logs
supabase functions logs --follow

# Get anon key
supabase status | grep "anon key:"

# Test health check
curl http://localhost:54321/functions/v1/save-wordlist

# Start frontend
pnpm dev
```

## Success Criteria

Before deploying to production, ensure:

- ✅ `./scripts/check-local-setup.sh` passes
- ✅ `./scripts/test-local-edge-functions.sh` passes (10/10 tests)
- ✅ Frontend works with local functions
- ✅ No errors in function logs
- ✅ Health checks return 200 OK
- ✅ Invalid requests return proper 401 errors
- ✅ Valid requests work as expected

---

**Status:** Ready for Local Testing
**Next:** Run `./scripts/check-local-setup.sh` to begin
