# Local Testing Guide - Authorization Header Fix

## Prerequisites

Make sure you have local Supabase running:

```bash
# Check if Supabase is running
supabase status

# If not running, start it
supabase start
```

## Step 1: Serve Edge Functions Locally

Supabase CLI provides a local function server:

```bash
# From project root
cd supabase

# Serve all functions locally
supabase functions serve

# Or serve a specific function
supabase functions serve save-wordlist
```

This will start the functions server on `http://localhost:54321/functions/v1/`

## Step 2: Get Your Local Credentials

```bash
# Get local Supabase credentials
supabase status
```

You'll see output like:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
Inbucket URL: http://localhost:54324
anon key: eyJhbGc...
service_role key: eyJhbGc...
```

## Step 3: Test Health Check Endpoint

### Test 1: Health Check (No Auth Required)

```bash
# Should return healthy status
curl http://localhost:54321/functions/v1/save-wordlist

# Expected response:
# {"status":"healthy","timestamp":"2025-10-13T..."}
```

### Test 2: Missing Session ID

```bash
# POST without session ID - should return 401
curl -X POST http://localhost:54321/functions/v1/save-wordlist \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_LOCAL_ANON_KEY" \
  -d '{
    "filename": "test.pdf",
    "documentType": "pdf",
    "words": [{"en": "test", "zh": "测试"}]
  }'

# Expected response:
# {"success":false,"error":{"code":"UNAUTHORIZED","message":"Session ID required"}}
```

### Test 3: Valid Request with Session ID

```bash
# POST with session ID - should work
curl -X POST http://localhost:54321/functions/v1/save-wordlist \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_LOCAL_ANON_KEY" \
  -H "X-Session-ID: test-session-123" \
  -d '{
    "filename": "test.pdf",
    "documentType": "pdf",
    "words": [{"en": "hello", "zh": "你好"}, {"en": "world", "zh": "世界"}]
  }'

# Expected response:
# {"success":true,"wordlistId":"..."}
```

## Step 4: Test All Functions

Create a test script:

```bash
# Create test script
cat > test-local-functions.sh << 'EOF'
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get local anon key from supabase status
ANON_KEY=$(supabase status | grep "anon key:" | awk '{print $3}')
BASE_URL="http://localhost:54321/functions/v1"
SESSION_ID="test-session-$(date +%s)"

echo "Testing with Session ID: $SESSION_ID"
echo "Using Anon Key: ${ANON_KEY:0:20}..."
echo ""

# Test 1: Health Check
echo -e "${YELLOW}Test 1: Health Check${NC}"
RESPONSE=$(curl -s "$BASE_URL/save-wordlist")
if echo "$RESPONSE" | grep -q "healthy"; then
  echo -e "${GREEN}✓ Health check passed${NC}"
else
  echo -e "${RED}✗ Health check failed${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 2: Missing Session ID
echo -e "${YELLOW}Test 2: Missing Session ID${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/save-wordlist" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{"filename":"test.pdf","documentType":"pdf","words":[{"en":"test","zh":"测试"}]}')
if echo "$RESPONSE" | grep -q "UNAUTHORIZED"; then
  echo -e "${GREEN}✓ Correctly rejected request without session ID${NC}"
else
  echo -e "${RED}✗ Should have rejected request${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 3: Valid Save Request
echo -e "${YELLOW}Test 3: Valid Save Request${NC}"
RESPONSE=$(curl -s -X POST "$BASE_URL/save-wordlist" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "X-Session-ID: $SESSION_ID" \
  -d '{"filename":"test.pdf","documentType":"pdf","words":[{"en":"hello","zh":"你好"},{"en":"world","zh":"世界"}]}')
if echo "$RESPONSE" | grep -q "success.*true"; then
  WORDLIST_ID=$(echo "$RESPONSE" | grep -o '"wordlistId":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✓ Successfully saved wordlist${NC}"
  echo "Wordlist ID: $WORDLIST_ID"
else
  echo -e "${RED}✗ Failed to save wordlist${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 4: Fetch Wordlists
echo -e "${YELLOW}Test 4: Fetch Wordlists${NC}"
RESPONSE=$(curl -s "$BASE_URL/fetch-wordlists" \
  -H "apikey: $ANON_KEY" \
  -H "X-Session-ID: $SESSION_ID")
if echo "$RESPONSE" | grep -q "success.*true"; then
  echo -e "${GREEN}✓ Successfully fetched wordlists${NC}"
  echo "Response: $RESPONSE" | head -c 200
  echo "..."
else
  echo -e "${RED}✗ Failed to fetch wordlists${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 5: Process Document (if you have a test file)
echo -e "${YELLOW}Test 5: Process Document Health Check${NC}"
RESPONSE=$(curl -s "$BASE_URL/process-document")
if echo "$RESPONSE" | grep -q "healthy"; then
  echo -e "${GREEN}✓ Process document health check passed${NC}"
else
  echo -e "${RED}✗ Process document health check failed${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 6: Generate Practice Questions Health Check
echo -e "${YELLOW}Test 6: Generate Practice Questions Health Check${NC}"
RESPONSE=$(curl -s "$BASE_URL/generate-practice-questions")
if echo "$RESPONSE" | grep -q "healthy"; then
  echo -e "${GREEN}✓ Generate practice questions health check passed${NC}"
else
  echo -e "${RED}✗ Generate practice questions health check failed${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

echo -e "${GREEN}Testing complete!${NC}"
EOF

chmod +x test-local-functions.sh
```

Run the test script:

```bash
./test-local-functions.sh
```

## Step 5: Test with Your Frontend

Update your `.env.local` to point to local Supabase:

```bash
# .env.local
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key-from-supabase-status
```

Then start your dev server:

```bash
pnpm dev
```

Your frontend will now call the local edge functions!

## Step 6: Monitor Function Logs

In a separate terminal, watch the function logs:

```bash
# Watch all function logs
supabase functions logs --follow

# Or watch a specific function
supabase functions logs save-wordlist --follow
```

## Step 7: Debug with Deno Inspector

For deeper debugging, you can use Deno's inspector:

```bash
# Serve with inspector enabled
supabase functions serve --inspect-brk

# Then open Chrome DevTools
# Navigate to: chrome://inspect
# Click "inspect" on your function
```

## Common Issues & Solutions

### Issue: "Function not found"

**Solution:**
```bash
# Make sure functions are deployed locally
supabase functions deploy save-wordlist --local

# Or restart the functions server
supabase functions serve
```

### Issue: "Connection refused"

**Solution:**
```bash
# Check if Supabase is running
supabase status

# If not, start it
supabase start

# Check if functions server is running
ps aux | grep "supabase functions serve"
```

### Issue: "Import errors in functions"

**Solution:**
```bash
# Make sure you're in the supabase directory
cd supabase

# Check deno.json is present
cat functions/deno.json

# Restart functions server
supabase functions serve
```

### Issue: "CORS errors in browser"

**Solution:**
The local functions server should handle CORS automatically, but if you see issues:

```bash
# Check your .env.local has the correct URL
echo $VITE_SUPABASE_URL

# Should be: http://localhost:54321
```

## Quick Test Commands

### Test All Health Checks
```bash
for func in save-wordlist delete-wordlist fetch-wordlists process-document generate-practice-questions; do
  echo "Testing $func..."
  curl -s "http://localhost:54321/functions/v1/$func" | jq
done
```

### Test with Session ID
```bash
SESSION_ID="test-$(date +%s)"
ANON_KEY=$(supabase status | grep "anon key:" | awk '{print $3}')

curl -X POST "http://localhost:54321/functions/v1/save-wordlist" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -H "X-Session-ID: $SESSION_ID" \
  -d '{"filename":"test.pdf","documentType":"pdf","words":[{"en":"test","zh":"测试"}]}' | jq
```

### Check Function Logs
```bash
# Last 50 log entries
supabase functions logs --limit 50

# Follow logs in real-time
supabase functions logs --follow
```

## Automated Testing

You can also run your existing tests against local Supabase:

```bash
# Make sure local Supabase is running
supabase start

# Run tests
pnpm test

# Run specific edge function tests
pnpm test supabase/functions
```

## Success Criteria

After testing locally, you should see:

✅ Health checks return `{"status":"healthy",...}`
✅ Missing session ID returns `401` with clear error
✅ Valid requests work as expected
✅ No "Missing authorization header" errors in logs
✅ Frontend can interact with local functions
✅ All existing functionality works

## Next Steps

Once local testing passes:

1. Commit your changes
2. Deploy to production: `supabase functions deploy`
3. Monitor production logs for 24 hours
4. Verify no authorization errors

---

**Quick Start:**
```bash
# Terminal 1: Start Supabase
supabase start
supabase functions serve

# Terminal 2: Watch logs
supabase functions logs --follow

# Terminal 3: Run tests
./test-local-functions.sh

# Terminal 4: Start frontend
pnpm dev
```
