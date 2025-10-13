# Quick Local Testing - 3 Steps

## Step 1: Start Supabase Functions

```bash
# Terminal 1: Start Supabase (if not already running)
supabase start

# Terminal 2: Serve functions locally
supabase functions serve
```

## Step 2: Run Automated Tests

```bash
# Terminal 3: Run the test script
./scripts/test-local-edge-functions.sh
```

Expected output:
```
╔════════════════════════════════════════════════════════╗
║  Testing Local Edge Functions - Auth Header Fix      ║
╚════════════════════════════════════════════════════════╝

✓ Supabase is running

Test 1: Health Check - save-wordlist
✓ PASSED

Test 2: Health Check - delete-wordlist
✓ PASSED

...

╔════════════════════════════════════════════════════════╗
║  ✓ All tests passed! Ready for deployment.            ║
╚════════════════════════════════════════════════════════╝
```

## Step 3: Manual Quick Tests

### Test Health Check
```bash
curl http://localhost:54321/functions/v1/save-wordlist
# → {"status":"healthy","timestamp":"..."}
```

### Test Missing Auth
```bash
ANON_KEY=$(supabase status | grep "anon key:" | awk '{print $3}')

curl -X POST http://localhost:54321/functions/v1/save-wordlist \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{"filename":"test.pdf","documentType":"pdf","words":[{"en":"test","zh":"测试"}]}'
# → {"success":false,"error":{"code":"UNAUTHORIZED",...}}
```

### Test Valid Request
```bash
ANON_KEY=$(supabase status | grep "anon key:" | awk '{print $3}')
SESSION_ID="test-$(date +%s)"

curl -X POST http://localhost:54321/functions/v1/save-wordlist \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "X-Session-ID: $SESSION_ID" \
  -d '{"filename":"test.pdf","documentType":"pdf","words":[{"en":"hello","zh":"你好"}]}'
# → {"success":true,"wordlistId":"..."}
```

## Troubleshooting

### "Supabase is not running"
```bash
supabase start
```

### "Function not found"
```bash
# Make sure you're serving functions
supabase functions serve
```

### "Connection refused"
```bash
# Check Supabase status
supabase status

# Restart if needed
supabase stop
supabase start
```

## Watch Logs

```bash
# In another terminal
supabase functions logs --follow
```

You should see:
- ✅ No "Missing authorization header" errors
- ✅ Health check requests returning 200
- ✅ Clear 401 responses for missing auth

## Test with Frontend

1. Update `.env.local`:
   ```bash
   VITE_SUPABASE_URL=http://localhost:54321
   VITE_SUPABASE_ANON_KEY=your-local-anon-key
   ```

2. Start dev server:
   ```bash
   pnpm dev
   ```

3. Test in browser:
   - Upload a document
   - Save a wordlist
   - View saved wordlists
   - Generate practice questions

All should work normally!

---

**Quick Commands:**
```bash
# Start everything
supabase start && supabase functions serve

# Run tests
./scripts/test-local-edge-functions.sh

# Watch logs
supabase functions logs --follow
```
